import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { medicineSearchSchema } from '../utils/validation.js';
import { optionalAuth } from '../middleware/auth.js';
import * as medicinesController from '../controllers/medicines.controller.js';

const router = Router();

// Search medicines
router.get(
    '/search',
    optionalAuth,
    validate(medicineSearchSchema, 'query'),
    medicinesController.searchMedicines
);

// Get all categories
router.get('/categories', medicinesController.getCategories);

// Get Ayurvedic medicines
router.get('/ayurveda', medicinesController.getAyurvedicMedicines);

// Get medicines by category
router.get('/category/:category', medicinesController.getMedicinesByCategory);

// Get medicine by ID
router.get('/:id', medicinesController.getMedicineById);

// Get generic alternative
router.get('/:id/generic', medicinesController.getGenericAlternative);

export default router;
