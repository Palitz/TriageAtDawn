import { Request, Response } from 'express';
import { query } from '../config/db';

export const getPriorityQueue = async (req: Request, res: Response) => {
  const { doctorId } = req.query;

  try {
    const docRes = await query('SELECT specialization FROM doctors WHERE id = $1', [doctorId]);
    if (docRes.rows.length === 0) return res.status(404).json({ message: 'Doctor not found' });
    
    const specialization = docRes.rows[0].specialization;

    const sql = `
      SELECT 
        b.id, 
        p.name, 
        b.severity_level, 
        b.symptoms,
        b.booking_time,
        EXTRACT(EPOCH FROM (NOW() - b.booking_time))/3600 as hours_waiting,
        (b.severity_level * 10) + (EXTRACT(EPOCH FROM (NOW() - b.booking_time))/3600 * 2) as priority_score
      FROM bookings b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.status = 'QUEUED' 
      AND b.specialization_needed = $1
      ORDER BY priority_score DESC
    `;

    const { rows } = await query(sql, [specialization]);
    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};