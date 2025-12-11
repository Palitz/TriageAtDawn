import { Request, Response } from 'express';
import { query } from '../config/db';

// The word 'export' here is crucial!
export const createShift = async (req: Request, res: Response) => {
  const { doctorId, startTime, durationMinutes, slotDuration = 15 } = req.body;
  
  try {
    const start = new Date(startTime);
    // Calculate end time based on duration
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const totalSlots = Math.floor(durationMinutes / slotDuration);

    // 1. Create Shift
    const shiftResult = await query(
      'INSERT INTO shifts (doctor_id, start_time, end_time, total_slots) VALUES ($1, $2, $3, $4) RETURNING id',
      [doctorId, start, end, totalSlots]
    );
    const shiftId = shiftResult.rows[0].id;

    // 2. Generate Slots Loop
    for (let i = 0; i < totalSlots; i++) {
      const slotStart = new Date(start.getTime() + i * slotDuration * 60000);
      await query(
        'INSERT INTO slots (shift_id, start_time) VALUES ($1, $2)',
        [shiftId, slotStart]
      );
    }

    res.status(201).json({ message: `Shift created with ${totalSlots} slots.` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};