import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { validate } from '../middleware/validation.js';
import { locationSchema } from '../utils/validation.js';
import { findNearestDarkStore, getDarkStoresByCity, getServiceableCities, isLocationServiceable } from '../services/geofence.service.js';
import { z } from 'zod';

const router = Router();

// Get serviceable cities
router.get('/cities', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const cities = await getServiceableCities();
        res.json({ success: true, data: cities });
    } catch (error) {
        next(error);
    }
});

// Find nearest dark store
router.post(
    '/nearest',
    validate(z.object({ location: locationSchema })),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { location } = req.body;
            const darkStore = await findNearestDarkStore(location);
            res.json({ success: true, data: darkStore });
        } catch (error) {
            next(error);
        }
    }
);

// Check if location is serviceable
router.post(
    '/check-serviceable',
    validate(z.object({ location: locationSchema })),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { location } = req.body;
            const serviceable = await isLocationServiceable(location);
            res.json({ success: true, data: { serviceable } });
        } catch (error) {
            next(error);
        }
    }
);

// Get dark stores by city
router.get('/city/:city', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { city } = req.params;
        const stores = await getDarkStoresByCity(city);
        res.json({ success: true, data: stores });
    } catch (error) {
        next(error);
    }
});

// Get dark store by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, name, city, address, phone, pharmacist_name, pharmacist_license,
              ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude,
              geofence_radius_meters, opening_time, closing_time
       FROM dark_stores WHERE id = $1 AND is_active = TRUE`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Dark store not found' });
            return;
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

// Get inventory for dark store
router.get('/:id/inventory', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { category, search, page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
      SELECT m.id, m.name, m.generic_name, m.mrp, m.schedule_type, m.category,
             m.is_ayurvedic, m.image_url, i.stock_quantity
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.id
      WHERE i.dark_store_id = $1 AND i.stock_quantity > 0 AND m.is_active = TRUE
    `;

        const params: (string | number)[] = [id];

        if (category) {
            query += ` AND LOWER(m.category) = LOWER($${params.length + 1})`;
            params.push(category as string);
        }

        if (search) {
            query += ` AND (LOWER(m.name) LIKE LOWER($${params.length + 1}) OR LOWER(m.generic_name) LIKE LOWER($${params.length + 1}))`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY m.name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);

        const result = await pool.query(query, params);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
});

export default router;
