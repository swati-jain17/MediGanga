
import { Request, Response, NextFunction } from 'express';
// import multer from 'multer'; // Removed: using Cloudinary from config
import pool from '../config/database.js';

import { isHighConfidenceOCR } from '../services/ocr.service.js';
import { sendPrescriptionVerified } from '../services/notification.service.js';
import { upload as cloudinaryUpload } from '../config/cloudinary.js';


// Configure multer for Cloudinary storage
const upload = cloudinaryUpload.single('prescription');

export const uploadMiddleware = upload;


/**
 * Upload and process prescription image
 */
export async function uploadPrescriptionHandler(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { issued_date } = req.body;

        if (!req.file) {
            res.status(400).json({ success: false, error: 'No image file provided' });
            return;
        }

        // Cloudinary returns the URL in req.file.path
        const imageUrl = req.file.path;

        // Process with OCR (optional: if you want to skip OCR for now, remove this block or adapt it)
        // Note: OCR might fail if it expects a buffer and Cloudinary only gives a URL. 
        // For now, let's try to fetch the image or skip OCR if buffer is missing.
        // Cloudinary storage doesn't provide buffer by default.
        // We'll skip OCR for this step to ensure upload works first, or fetch it.
        // Simple buffer fetch for OCR:
        let ocrData = {};
        let confidence = 0;

        try {
            // const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            // const buffer = Buffer.from(response.data, 'binary');
            // const result = await processPrescription(buffer, imageUrl);
            // ocrData = result.ocrData;
            // confidence = result.confidence;

            // Temporary skip OCR to focus on storage fix
            console.log('Skipping OCR for Cloudinary upload (to be re-enabled)');
        } catch (e) {
            console.warn('OCR processing failed:', e);
        }

        // Auto-verify if high confidence
        const autoVerified = isHighConfidenceOCR(confidence);

        // Save prescription
        const result = await pool.query(
            `INSERT INTO prescriptions(
    user_id, image_url, ocr_data, ocr_confidence,
    issued_date, pharmacist_verified
) VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id, image_url, ocr_data, ocr_confidence, pharmacist_verified, issued_date, expiry_date, is_expired`,
            [
                userId,
                imageUrl,
                JSON.stringify(ocrData),
                confidence,
                issued_date || new Date().toISOString().split('T')[0],
                autoVerified
            ]
        );

        const prescription = result.rows[0];

        res.status(201).json({
            success: true,
            data: {
                ...prescription,
                autoVerified,
                message: autoVerified
                    ? 'Prescription verified automatically. You can proceed to checkout.'
                    : 'Prescription uploaded. Pending pharmacist verification.',
            },
        });
    } catch (error) {
        next(error);
    }
}


/**
 * Get user's prescriptions
 */
export async function getUserPrescriptions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;

        const result = await pool.query(
            `SELECT id, image_url, ocr_data, ocr_confidence, pharmacist_verified,
    verified_at, issued_date, expiry_date, is_expired, created_at
       FROM prescriptions 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [userId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}

/**
 * Get prescription by ID
 */
export async function getPrescriptionById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        const result = await pool.query(
            `SELECT * FROM prescriptions WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Prescription not found' });
            return;
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

/**
 * Get valid (non-expired, verified) prescriptions for checkout
 */
export async function getValidPrescriptions(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;

        const result = await pool.query(
            `SELECT id, image_url, ocr_data, issued_date, expiry_date
       FROM prescriptions 
       WHERE user_id = $1 
         AND is_expired = FALSE
         AND pharmacist_verified = TRUE
       ORDER BY expiry_date DESC`,
            [userId]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}

/**
 * Pharmacist: Verify prescription
 */
export async function verifyPrescription(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const pharmacistId = req.user!.userId;
        const { approved, notes } = req.body;

        const result = await pool.query(
            `UPDATE prescriptions 
       SET pharmacist_verified = $2,
    verified_by = $3,
    verified_at = NOW(),
    verification_notes = $4
       WHERE id = $1
       RETURNING id, user_id, pharmacist_verified`,
            [id, approved, pharmacistId, notes]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Prescription not found' });
            return;
        }

        // Notify user
        const userResult = await pool.query(
            'SELECT phone FROM users WHERE id = $1',
            [result.rows[0].user_id]
        );

        if (userResult.rows.length > 0) {
            await sendPrescriptionVerified(userResult.rows[0].phone, id, approved);
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: approved ? 'Prescription approved' : 'Prescription rejected',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Pharmacist: Get pending prescriptions
 */
export async function getPendingPrescriptions(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await pool.query(
            `SELECT p.id, p.image_url, p.ocr_data, p.ocr_confidence, p.issued_date, p.created_at,
    u.phone as user_phone, u.name as user_name
       FROM prescriptions p
       JOIN users u ON p.user_id = u.id
       WHERE p.pharmacist_verified = FALSE
         AND p.is_expired = FALSE
       ORDER BY p.created_at ASC`
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
}
