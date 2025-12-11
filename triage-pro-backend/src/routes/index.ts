import { Router } from 'express';
import { createBooking } from '../controllers/bookingController';
import { createShift } from '../controllers/adminController';
import { getShifts } from '../controllers/viewController';
import { registerAndTriage } from '../controllers/triageController';
import { getPriorityQueue } from '../controllers/queueController';

const router = Router();
router.post('/admin/shifts', createShift);
router.get('/shifts', getShifts);
router.post('/bookings', createBooking);
router.post('/triage', registerAndTriage);
router.get('/doctor/queue', getPriorityQueue);

export default router;