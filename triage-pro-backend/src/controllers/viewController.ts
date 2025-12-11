import { Request, Response } from 'express';
import { query } from '../config/db';

export const getShifts = async (req: Request, res: Response) => {
  try {
    // We join Doctors and Shifts so the frontend gets everything in one go
    const sql = `
      SELECT 
        s.id as shift_id,
        s.start_time,
        s.end_time,
        s.total_slots,
        d.id as doctor_id,
        d.name as doctor_name,
        d.specialization
      FROM shifts s
      JOIN doctors d ON s.doctor_id = d.id
      ORDER BY s.start_time ASC
    `;
    
    const { rows } = await query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};