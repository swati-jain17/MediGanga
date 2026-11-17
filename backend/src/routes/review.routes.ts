import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { submitReview, getRecentReviews } from '../controllers/reviewController.js';

const router = Router();

// Public routes
router.get('/', getRecentReviews);

// Protected routes
router.post('/', authenticate, submitReview);

export default router;
