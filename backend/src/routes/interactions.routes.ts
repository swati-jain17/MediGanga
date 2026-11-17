import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { interactionCheckSchema } from '../utils/validation.js';
import { optionalAuth } from '../middleware/auth.js';
import * as interactionsController from '../controllers/interactions.controller.js';

const router = Router();

// Check drug interactions
router.post(
    '/check',
    optionalAuth,
    validate(interactionCheckSchema),
    interactionsController.checkDrugInteractions
);

// Get interactions for single medicine
router.get(
    '/medicine/:id',
    interactionsController.getSingleMedicineInteractions
);

// Check with health profile
router.post(
    '/check-with-profile',
    optionalAuth,
    interactionsController.checkWithHealthProfile
);

export default router;
