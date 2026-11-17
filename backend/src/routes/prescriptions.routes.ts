import { Router } from 'express';
import { authenticate, requirePharmacist } from '../middleware/auth.js';
import * as prescriptionsController from '../controllers/prescriptions.controller.js';

const router = Router();

// Upload prescription (protected)
router.post(
    '/upload',
    authenticate,
    prescriptionsController.uploadMiddleware,
    prescriptionsController.uploadPrescriptionHandler
);

// Get user's prescriptions
router.get(
    '/',
    authenticate,
    prescriptionsController.getUserPrescriptions
);

// Get valid prescriptions for checkout
router.get(
    '/valid',
    authenticate,
    prescriptionsController.getValidPrescriptions
);

// Get prescription by ID
router.get(
    '/:id',
    authenticate,
    prescriptionsController.getPrescriptionById
);

// Pharmacist: Get pending prescriptions
router.get(
    '/pending/all',
    authenticate,
    requirePharmacist,
    prescriptionsController.getPendingPrescriptions
);

// Pharmacist: Verify prescription
router.put(
    '/:id/verify',
    authenticate,
    requirePharmacist,
    prescriptionsController.verifyPrescription
);

export default router;
