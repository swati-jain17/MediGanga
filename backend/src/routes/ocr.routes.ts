import { Router } from 'express';
import { analyzePrescription } from '../controllers/ocr.controller.js';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', authenticate, upload.single('image'), analyzePrescription);

export default router;
