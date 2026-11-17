import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as loyaltyController from '../controllers/loyalty.controller.js';

const router = Router();

// All routes require authentication
router.get('/balance', authenticate, loyaltyController.getBalance);
router.get('/rewards', authenticate, loyaltyController.getRewards);
router.post('/redeem', authenticate, loyaltyController.redeemPoints);
router.post('/adherence', authenticate, loyaltyController.recordAdherence);

export default router;
