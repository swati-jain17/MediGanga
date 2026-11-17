import { Request, Response } from 'express';
import pool from '../config/database.js';

// Submit a review (User)
export const submitReview = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId; // Assuming authenticate middleware populates this
        const { rating, comment } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ success: false, error: 'Invalid rating (1-5)' });
            return;
        }

        const query = `
            INSERT INTO reviews (user_id, rating, comment, status)
            VALUES ($1, $2, $3, 'approved')
            RETURNING *
        `;
        const result = await pool.query(query, [userId, rating, comment]);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Review submitted successfully'
        });

    } catch (error) {
        console.error('Submit Review Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Get recent reviews (Public)
export const getRecentReviews = async (_req: Request, res: Response) => {
    try {
        const query = `
            SELECT r.*, u.name as user_name, u.profile_picture
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.status = 'approved'
            ORDER BY r.created_at DESC
            LIMIT 10
        `;
        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get Recent Reviews Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Get all reviews (Admin)
export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const countQuery = 'SELECT COUNT(*) FROM reviews';
        const countResult = await pool.query(countQuery);
        const total = parseInt(countResult.rows[0].count);

        const query = `
            SELECT r.*, u.name as user_name, u.email as user_email
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        console.error('Get All Reviews Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Delete review (Admin)
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Review not found' });
            return;
        }

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
