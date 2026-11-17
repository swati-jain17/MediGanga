import { Request, Response } from 'express';
import { db } from '../config/database.js';

/**
 * Emergency Controller
 * Handles MediGanga Rapid - emergency delivery within 60-90 minutes
 */

// Check if emergency delivery is available for user's location
export async function checkAvailability(req: Request, res: Response) {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Location (latitude, longitude) required'
            });
        }

        const lat = parseFloat(latitude as string);
        const lng = parseFloat(longitude as string);

        // Find nearby dark stores that support emergency delivery (within 10km)
        const result = await db.query(`
            SELECT id, name, city, address, latitude, longitude,
                   (6371 * acos(
                       cos(radians($1)) * cos(radians(latitude)) *
                       cos(radians(longitude) - radians($2)) +
                       sin(radians($1)) * sin(radians(latitude))
                   )) AS distance_km
            FROM dark_stores
            WHERE supports_emergency = TRUE
              AND is_active = TRUE
              AND (6371 * acos(
                       cos(radians($1)) * cos(radians(latitude)) *
                       cos(radians(longitude) - radians($2)) +
                       sin(radians($1)) * sin(radians(latitude))
                   )) <= 10
            ORDER BY distance_km ASC
            LIMIT 1
        `, [lat, lng]);

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                data: {
                    available: false,
                    message: 'Emergency delivery is not available in your area yet.',
                    nearestCity: null
                }
            });
        }

        const store = result.rows[0];
        const surgeFee = store.distance_km > 5 ? 49 : 29; // Higher fee for farther distances
        const estimatedMinutes = Math.round(20 + (store.distance_km * 5)); // Base 20 min + 5 min/km

        res.json({
            success: true,
            data: {
                available: true,
                store: {
                    id: store.id,
                    name: store.name,
                    city: store.city,
                    distance: Math.round(store.distance_km * 10) / 10
                },
                surgeFee,
                estimatedMinutes: Math.min(estimatedMinutes, 90), // Cap at 90 min
                message: `Emergency delivery available! Estimated ${estimatedMinutes} minutes.`
            }
        });
    } catch (error: any) {
        console.error('Check emergency availability error:', error);
        res.status(500).json({ success: false, error: 'Failed to check availability' });
    }
}

// Get medicines available for emergency delivery
export async function getEmergencyMedicines(req: Request, res: Response) {
    try {
        const { storeId, query, category, page = 1, limit = 20 } = req.query;

        if (!storeId) {
            return res.status(400).json({ success: false, error: 'Store ID required' });
        }

        const offset = (Number(page) - 1) * Number(limit);

        let whereClause = `
            WHERE m.is_emergency_available = TRUE
              AND m.is_active = TRUE
              AND i.stock_quantity > 0
              AND i.dark_store_id = $1
        `;
        const params: any[] = [storeId];

        if (query) {
            params.push(`%${query}%`);
            whereClause += ` AND (m.name ILIKE $${params.length} OR m.generic_name ILIKE $${params.length})`;
        }

        if (category) {
            params.push(category);
            whereClause += ` AND m.category = $${params.length}`;
        }

        // Get total count
        const countResult = await db.query(`
            SELECT COUNT(*) as total
            FROM medicines m
            JOIN inventory i ON m.id = i.medicine_id
            ${whereClause}
        `, params);

        // Get medicines with stock
        params.push(Number(limit), offset);
        const result = await db.query(`
            SELECT m.id, m.name, m.generic_name, m.category, m.mrp, m.dosage_form,
                   m.pack_size, m.schedule_type, m.description,
                   i.stock_quantity as available_stock
            FROM medicines m
            JOIN inventory i ON m.id = i.medicine_id
            ${whereClause}
            ORDER BY m.category, m.name
            LIMIT $${params.length - 1} OFFSET $${params.length}
        `, params);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].total),
                totalPages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
            }
        });
    } catch (error: any) {
        console.error('Get emergency medicines error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch medicines' });
    }
}

// Get emergency categories
export async function getEmergencyCategories(_req: Request, res: Response) {
    try {
        const categories = [
            { id: 'Pain Relief', name: 'Pain Relief', icon: '💊', description: 'Headache, body pain, fever' },
            { id: 'Allergy', name: 'Allergy', icon: '🤧', description: 'Antihistamines, cold, cough' },
            { id: 'Cold & Flu', name: 'Cold & Flu', icon: '🤒', description: 'Fever, congestion, sore throat' },
            { id: 'Gastric', name: 'Stomach', icon: '🫃', description: 'Acidity, nausea, digestion' },
            { id: 'Skin Care', name: 'First Aid', icon: '🩹', description: 'Cuts, burns, antiseptic' },
        ];

        res.json({ success: true, data: categories });
    } catch (error: any) {
        console.error('Get emergency categories error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
}

// Create emergency order
export async function createEmergencyOrder(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { orderId, surgeFee, estimatedMinutes, priorityLevel = 'high' } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, error: 'Order ID required' });
        }

        // Create emergency order record
        const result = await db.query(`
            INSERT INTO emergency_orders (order_id, priority_level, surge_fee, estimated_delivery_minutes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [orderId, priorityLevel, surgeFee || 29, estimatedMinutes || 60]);

        // Update order with emergency flag
        await db.query(`
            UPDATE orders 
            SET delivery_type = 'emergency', 
                estimated_delivery = NOW() + INTERVAL '${estimatedMinutes || 60} minutes'
            WHERE id = $1
        `, [orderId]);

        res.json({
            success: true,
            data: result.rows[0],
            message: `🚨 Emergency order created! Estimated delivery in ${estimatedMinutes || 60} minutes.`
        });
    } catch (error: any) {
        console.error('Create emergency order error:', error);
        res.status(500).json({ success: false, error: 'Failed to create emergency order' });
    }
}
