import { Request, Response } from 'express';
import pool from '../../config/database.js';

export const getPrescriptions = async (req: Request, res: Response) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT p.*, u.name as user_name, u.phone as user_phone
            FROM prescriptions p
            JOIN users u ON p.user_id = u.id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (status === 'pending') {
            query += ` AND p.pharmacist_verified = FALSE AND p.verification_notes IS NULL`;
        } else if (status === 'verified') {
            query += ` AND p.pharmacist_verified = TRUE`;
        } else if (status === 'rejected') {
            query += ` AND p.pharmacist_verified = FALSE AND p.verification_notes IS NOT NULL`;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Count total
        const countResult = await pool.query(`SELECT COUNT(*) FROM prescriptions`);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get Prescriptions Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const verifyPrescription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { action, notes } = req.body; // action: 'approve' | 'reject'
        const adminId = req.user?.userId; // Assuming auth middleware adds user

        if (!['approve', 'reject'].includes(action)) {
            res.status(400).json({ success: false, error: 'Invalid action' });
            return;
        }

        const isVerified = action === 'approve';

        // If rejected, ensure notes are provided (or use standardized rejection reasons)
        const verificationNotes = notes || (isVerified ? 'Verified by Admin' : 'Rejected by Admin');

        const query = `
            UPDATE prescriptions
            SET 
                pharmacist_verified = $1,
                verification_notes = $2,
                verified_by = $3,
                verified_at = NOW()
            WHERE id = $4
            RETURNING *
        `;

        const result = await pool.query(query, [isVerified, verificationNotes, adminId, id]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Prescription not found' });
            return;
        }

        // TODO: Send notification to user about status change

        res.json({
            success: true,
            data: result.rows[0],
            message: `Prescription ${isVerified ? 'verified' : 'rejected'} successfully`
        });

    } catch (error) {
        console.error('Verify Prescription Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
