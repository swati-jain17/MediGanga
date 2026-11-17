import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as emergencyController from '../controllers/emergency.controller.js';

const router = Router();

// Public routes
router.get('/check', emergencyController.checkAvailability);
router.get('/categories', emergencyController.getEmergencyCategories);
router.get('/medicines', emergencyController.getEmergencyMedicines);

// Protected routes
router.post('/order', authenticate, emergencyController.createEmergencyOrder);

export default router;
