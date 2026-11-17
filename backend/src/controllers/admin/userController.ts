import { Request, Response } from 'express';
import pool from '../../config/database.js';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT id, name, email, phone, role, created_at, 
            (SELECT COUNT(*) FROM orders WHERE user_id = users.id) as total_orders
            FROM users
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (role && role !== 'all') {
            query += ` AND role = $${paramIndex++}`;
            params.push(role);
        }

        if (search) {
            query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Count
        let countQuery = `SELECT COUNT(*) FROM users WHERE 1=1`;
        const countParams: any[] = [];
        let countParamIndex = 1;

        if (role && role !== 'all') {
            countQuery += ` AND role = $${countParamIndex++}`;
            countParams.push(role);
        }
        if (search) {
            countQuery += ` AND (name ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex} OR phone ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
            countParamIndex++;
        }

        const countResult = await pool.query(countQuery, countParams);

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
        console.error('Get Users Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Allowed roles to be assigned by admin
        const validRoles = ['customer', 'pharmacist', 'delivery_partner', 'admin', 'order_manager', 'inventory_manager', 'prescription_verifier'];

        if (!validRoles.includes(role)) {
            res.status(400).json({ success: false, error: 'Invalid role' });
            return;
        }

        // Prevent self-demotion or modifying super_admin if not super_admin (simple check)
        // ideally middleware checks permissions. 
        // For now, let's just update.

        const query = `
            UPDATE users 
            SET role = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, name, email, role
        `;

        const result = await pool.query(query, [role, id]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'User role updated successfully'
        });

    } catch (error) {
        console.error('Update User Role Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
