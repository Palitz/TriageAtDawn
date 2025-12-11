import { Request, Response } from 'express';
import { getClient } from '../config/db';

const SPECIALIZATION_RULES = [
  { 
    dept: 'Orthopedics', 
    keywords: ['fracture', 'bone', 'broken', 'joint', 'knee', 'leg', 'ankle', 'wrist', 'pain in leg', 'pain in arm'] 
  },
  { 
    dept: 'Cardiology', 
    keywords: ['heart', 'chest', 'palpitation', 'attack', 'pressure', 'tightness', 'cardiac', 'pulse', 'pain'] 
  },
  { 
    dept: 'Oncology', 
    keywords: ['tumor', 'lump', 'cancer', 'chemo', 'radiation', 'growth', 'mass'] 
  }
];

const calculateSeverity = (symptoms: string, age: number): number => {
  const s = symptoms.toLowerCase();
  let score = 1;
  if (s.includes('chest') || s.includes('heart') || s.includes('unconscious') || s.includes('bleeding')) score = 5;
  else if (s.includes('fracture') || s.includes('broken') || s.includes('difficulty breathing')) score = 3;
  else if (s.includes('flu') || s.includes('fever')) score = 1;
  if (age > 65) score += 1;
  return Math.min(score, 5);
};

export const registerAndTriage = async (req: Request, res: Response) => {
  const { name, age, weight, height, history, symptoms, email } = req.body;
  
  // DEBUG LOGGING
  console.log("------------------------------------------------");
  console.log("🚑 TRIAGE REQUEST RECEIVED");
  console.log(`User Input Symptoms: "${symptoms}"`);
  
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // 1. Patient Profile
    const patientQuery = `
      INSERT INTO patients (name, age, weight_kg, height_cm, medical_history, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE 
      SET medical_history = $5, age = $2
      RETURNING id;
    `;
    const patientRes = await client.query(patientQuery, [name, age, weight, height, history, email]);
    const patientId = patientRes.rows[0].id;

    // 2. Determine Spec (With Logging)
    let spec = 'General Physician';
    const lowerSymptoms = symptoms.toLowerCase();

    for (const rule of SPECIALIZATION_RULES) {
      const match = rule.keywords.some(keyword => lowerSymptoms.includes(keyword));
      if (match) {
        console.log(`✅ MATCH FOUND! Keyword in rule "${rule.dept}" matched input.`);
        spec = rule.dept;
        break;
      }
    }
    console.log(`🏥 Assigned Department: ${spec}`);

    const severity = calculateSeverity(symptoms, age);
    console.log(`⚠️ Calculated Severity: ${severity}`);

    // 3. Ambulance Logic
    let ambulanceId = null;
    let ambulanceMsg = "Not needed";
    
    const ambCountRes = await client.query('SELECT COUNT(*) FROM ambulances WHERE is_available = TRUE');
    const availableAmbulances = parseInt(ambCountRes.rows[0].count);

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
        ambulanceMsg = `Unit ${ambRes.rows[0].plate_number} Dispatched`;
      } else {
        ambulanceMsg = "Delayed (All units busy)";
      }
    }

    // 4. Create Booking
    const bookingQuery = `
      INSERT INTO bookings (patient_id, status, severity_level, specialization_needed, ambulance_id, symptoms)
      VALUES ($1, 'QUEUED', $2, $3, $4, $5)
      RETURNING id
    `;
    await client.query(bookingQuery, [patientId, severity, spec, ambulanceId, symptoms]);

    // 5. Transparency Calc
    const myScore = severity * 10;
    const rankQuery = `
      SELECT COUNT(*) as ahead 
      FROM bookings 
      WHERE status = 'QUEUED' 
      AND specialization_needed = $1 
      AND ((severity_level * 10) + (EXTRACT(EPOCH FROM (NOW() - booking_time))/3600 * 2)) > $2
    `;
    const rankRes = await client.query(rankQuery, [spec, myScore]);
    const peopleAhead = parseInt(rankRes.rows[0].ahead);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Triage Complete',
      specialization: spec,
      severityLevel: severity,
      ambulance: ambulanceMsg,
      status: 'ADDED_TO_QUEUE',
      queueDetails: {
        position: peopleAhead + 1, 
        estimatedWaitMins: (peopleAhead + 1) * 15, 
        availableAmbulances
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Triage Failed' });
  } finally {
    client.release();
  }
};