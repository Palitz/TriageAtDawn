import { Request, Response } from 'express';
import { getClient } from '../config/db';

export const createBooking = async (req: Request, res: Response) => {
  const { patientName, patientEmail, slotIds, riskScore } = req.body;
  
  const client = await getClient();

  try {
    await client.query('BEGIN'); 
    
    const slotsQuery = `
      SELECT id, is_booked 
      FROM slots 
      WHERE id = ANY($1::int[]) 
      FOR UPDATE
    `;
    
    const { rows: selectedSlots } = await client.query(slotsQuery, [slotIds]);

    if (selectedSlots.length !== slotIds.length) {
      throw new Error('Some slots do not exist.');
    }

    const alreadyBooked = selectedSlots.some(slot => slot.is_booked);
    if (alreadyBooked) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: 'One or more selected slots were just taken by another user.',
        status: 'FAILED' 
      });
    }

    const bookingInsert = `
      INSERT INTO bookings (patient_name, patient_email, status, risk_score)
      VALUES ($1, $2, 'CONFIRMED', $3)
      RETURNING id
    `;
    const { rows: bookingRows } = await client.query(bookingInsert, [patientName, patientEmail, riskScore || 1]);
    const bookingId = bookingRows[0].id;

    const updateSlots = `
      UPDATE slots 
      SET is_booked = TRUE 
      WHERE id = ANY($1::int[])
    `;
    await client.query(updateSlots, [slotIds]);
    for (const slotId of slotIds) {
      await client.query(
        'INSERT INTO booking_slots (booking_id, slot_id) VALUES ($1, $2)',
        [bookingId, slotId]
      );
    }

    await client.query('COMMIT'); 

    res.status(201).json({
      message: 'Booking Successful',
      bookingId,
      status: 'CONFIRMED'
    });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Booking Transaction Error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    client.release(); 
  }
};