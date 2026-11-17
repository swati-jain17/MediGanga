import { Request, Response } from 'express';
import pool from '../../config/database.js';

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT o.*, u.name as user_name, u.phone as user_phone, u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (status && status !== 'all') {
            query += ` AND o.status = $${paramIndex++}`;
            params.push(status);
        }

        if (search) {
            query += ` AND (o.id::text ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Count total
        // Note: For optimized counting with search/filters, this should ideally mirror the where clause
        // For simplicity in MVP, we might count all or just count filtered rows separately if needed.
        // Let's do a simple total count for now or better, count filtered.

        let countQuery = `
            SELECT COUNT(*) 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;
        const countParams: any[] = [];
        let countParamIndex = 1;

        if (status && status !== 'all') {
            countQuery += ` AND o.status = $${countParamIndex++}`;
            countParams.push(status);
        }
        if (search) {
            countQuery += ` AND (o.id::text ILIKE $${countParamIndex} OR u.name ILIKE $${countParamIndex} OR u.phone ILIKE $${countParamIndex})`;
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
        console.error('Get Orders Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate status transition if needed
        // For now allow admin to set any valid status
        const validStatuses = ['placed', 'verified', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ success: false, error: 'Invalid status' });
            return;
        }

        const query = `
            UPDATE orders
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `;

        const result = await pool.query(query, [status, id]);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        // Send Notification logic here (Socket.IO emit)
        // We can import io from server.ts if we export it, or use a service.
        // For now, let's assume client polling or separate notification service.

        // Also note: update cancel_reason if cancelled
        if (status === 'cancelled' && notes) {
            await pool.query('UPDATE orders SET cancel_reason = $1 WHERE id = $2', [notes, id]);
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Order status updated'
        });

    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch Order
        const orderQuery = `
            SELECT o.*, u.name as user_name, u.phone as user_phone, u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `;
        const orderResult = await pool.query(orderQuery, [id]);

        if (orderResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        // Fetch Items
        const itemsQuery = `
            SELECT * FROM order_items WHERE order_id = $1
        `;
        const itemsResult = await pool.query(itemsQuery, [id]);

        res.json({
            success: true,
            data: {
                ...orderResult.rows[0],
                items: itemsResult.rows
            }
        });

    } catch (error) {
        console.error('Get Order Details Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
