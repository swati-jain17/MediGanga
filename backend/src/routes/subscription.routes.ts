import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as subscriptionController from '../controllers/subscription.controller.js';

const router = Router();

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Protected routes
router.get('/me', authenticate, subscriptionController.getMySubscription);
router.post('/subscribe', authenticate, subscriptionController.subscribe);
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);

export default router;
