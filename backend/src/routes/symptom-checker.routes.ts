import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import * as symptomController from '../controllers/symptom-checker.controller.js';

const router = Router();

// Public routes
router.get('/symptoms', symptomController.getCommonSymptoms);

// Optionally authenticated (saves history if logged in)
router.post('/analyze', optionalAuth, symptomController.analyzeSymptoms);

// Protected routes
router.get('/history', authenticate, symptomController.getHistory);
router.post('/:checkId/follow-up', authenticate, symptomController.markFollowedUp);

export default router;
