import { Request, Response } from 'express';
import { getClient, query } from '../config/db';

const SPECIALIZATION_MAP: Record<string, string> = {
  'fracture': 'Orthopedics',
  'joint_pain': 'Orthopedics',
  'chest_pain': 'Cardiology',
  'palpitations': 'Cardiology',
  'tumor': 'Oncology',
  'chemo': 'Oncology',
  'general_flu': 'General Physician'
};

const calculateSeverity = (symptoms: string, age: number): number => {
  let score = 1;
  if (symptoms.includes('chest_pain')) score = 5; // Critical
  else if (symptoms.includes('fracture')) score = 3;
  else if (symptoms.includes('flu')) score = 1;
  if (age > 65) score += 1;
  return Math.min(score, 5); 
};

export const registerAndTriage = async (req: Request, res: Response) => {
  const { name, age, weight, height, history, symptoms, email } = req.body;
  
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const patientQuery = `
      INSERT INTO patients (name, age, weight_kg, height_cm, medical_history, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE 
      SET medical_history = $5, age = $2
      RETURNING id;
    `;
    const patientRes = await client.query(patientQuery, [name, age, weight, height, history, email]);
    const patientId = patientRes.rows[0].id;

    let spec = 'General Physician';
    for (const key in SPECIALIZATION_MAP) {
      if (symptoms.toLowerCase().includes(key)) {
        spec = SPECIALIZATION_MAP[key];
        break;
      }
    }
    const severity = calculateSeverity(symptoms, age);
    let ambulanceId = null;
    let ambulanceMsg = "Not needed";
    
    if (severity >= 4) {
      const ambQuery = `
        UPDATE ambulances 
        SET is_available = FALSE 
        WHERE id = (
          SELECT id FROM ambulances WHERE is_available = TRUE LIMIT 1 FOR UPDATE SKIP LOCKED
        ) 
        RETURNING id, plate_number
      `;
      const ambRes = await client.query(ambQuery);
      
      if (ambRes.rows.length > 0) {
        ambulanceId = ambRes.rows[0].id;
        ambulanceMsg = `Ambulance ${ambRes.rows[0].plate_number} dispatched!`;
      } else {
        ambulanceMsg = "CRITICAL: No ambulances available.";
      }
    }

    const bookingQuery = `
      INSERT INTO bookings (patient_id, status, severity_level, specialization_needed, ambulance_id, symptoms)
      VALUES ($1, 'QUEUED', $2, $3, $4, $5)
      RETURNING id
    `;
    await client.query(bookingQuery, [patientId, severity, spec, ambulanceId, symptoms]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Triage Complete',
      specialization: spec,
      severityLevel: severity,
      ambulance: ambulanceMsg,
      status: 'ADDED_TO_QUEUE'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Triage Failed' });
  } finally {
    client.release();
  }
};