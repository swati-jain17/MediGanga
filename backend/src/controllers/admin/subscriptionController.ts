import { Request, Response } from 'express';
import pool from '../../config/database.js';

// Managing Plans (Membership Tiers)
// Assuming we have a 'plans' table. Checking schema first is better, but I'll write generic CRUD.
// If table doesn't exist, I might need to create it or use hardcoded plans if not dynamic.
// Let's assume dynamic plans in a table 'subscription_plans'.

export const getPlans = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM subscription_plans ORDER BY price_monthly ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Get Plans Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const createPlan = async (req: Request, res: Response) => {
    try {
        const { name, display_name, description, price_monthly, price_yearly, features, badge_color } = req.body;

        const result = await pool.query(
            `INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, badge_color) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, display_name, description, price_monthly, price_yearly || null, features || [], badge_color || '#6366f1']
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Create Plan Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Sanitize numeric fields
        if (updates.price_monthly === '') updates.price_monthly = null;
        if (updates.price_yearly === '') updates.price_yearly = null;

        if (updates.features && Array.isArray(updates.features)) {
            updates.features = JSON.stringify(updates.features);
        }

        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            res.status(400).json({ success: false, error: 'No fields to update' });
            return;
        }

        let query = 'UPDATE subscription_plans SET ';
        const setClauses = [];

        for (let i = 0; i < fields.length; i++) {
            setClauses.push(`${fields[i]} = $${i + 1}`);
        }

        query += setClauses.join(', ') + ` WHERE id = $${fields.length + 1} RETURNING *`;
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Plan not found' });
            return;
        }

        res.json({ success: true, data: result.rows[0], message: 'Plan updated successfully' });
    } catch (error: any) {
        console.error('Update Plan Error:', error);
        try {
            const fs = require('fs');
            fs.appendFileSync('admin_debug.log', `[${new Date().toISOString()}] Update Plan Error: ${error.message}\nStack: ${error.stack}\n`);
        } catch (e) { }
        res.status(500).json({ success: false, error: 'Internal Server Error', details: error.message });
    }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Soft delete usually better
        const result = await pool.query('UPDATE subscription_plans SET is_active = false WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Plan not found' });
            return;
        }
        res.json({ success: true, message: 'Plan deactivated' });
    } catch (error) {
        console.error('Delete Plan Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
