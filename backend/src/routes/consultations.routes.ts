import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as consultationsController from '../controllers/consultations.controller.js';

const router = Router();

// Public routes
router.get('/doctors', consultationsController.getDoctors);
router.get('/doctors/:doctorId', consultationsController.getDoctorById);
router.get('/doctors/:doctorId/slots', consultationsController.getAvailableSlots);
router.get('/specializations', consultationsController.getSpecializations);

// Protected routes
router.post('/book', authenticate, consultationsController.bookConsultation);
router.get('/my', authenticate, consultationsController.getMyConsultations);
router.get('/:consultationId', authenticate, consultationsController.getConsultationDetails);
router.post('/:consultationId/start', authenticate, consultationsController.startConsultation);
router.post('/:consultationId/end', authenticate, consultationsController.endConsultation);
router.post('/:consultationId/cancel', authenticate, consultationsController.cancelConsultation);

export default router;
