import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { getCache, setCache } from '../config/redis.js';
import type { Medicine, GenericAlternative, PaginatedResponse } from '../types/index.js';

/**
 * Search medicines with full-text search
 */
export async function searchMedicines(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { query, schedule_type, is_ayurvedic, page = 1, limit = 20, category, is_emergency } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        // Try cache first
        const cacheKey = `search:${query || ''}:${schedule_type}:${is_ayurvedic}:${category}:${is_emergency}:${page}:${limit}`;
        const cached = await getCache<PaginatedResponse<Medicine>>(cacheKey);
        if (cached) {
            res.json({ success: true, ...cached });
            return;
        }

        // Build query
        let searchQuery = `
      SELECT 
        id, name, generic_name, salt_composition, schedule_type,
        manufacturer, category, is_ayurvedic, mrp, generic_mrp,
        dosage_form, pack_size, image_url, is_emergency_available
      FROM medicines
      WHERE is_active = TRUE
        AND image_url IS NOT NULL AND image_url != ''
    `;

        const params: (string | number | boolean)[] = [];
        let paramIndex = 1;

        // Add text search if query is present
        if (query) {
            searchQuery = `
              SELECT 
                id, name, generic_name, salt_composition, schedule_type,
                manufacturer, category, is_ayurvedic, mrp, generic_mrp,
                dosage_form, pack_size, image_url, is_emergency_available,
                ts_rank(
                  to_tsvector('english', name || ' ' || COALESCE(generic_name, '') || ' ' || COALESCE(salt_composition, '')),
                  plainto_tsquery('english', $${paramIndex})
                ) as relevance
              FROM medicines
              WHERE is_active = TRUE
                AND image_url IS NOT NULL AND image_url != ''
                AND (
                  to_tsvector('english', name || ' ' || COALESCE(generic_name, '') || ' ' || COALESCE(salt_composition, '')) 
                  @@ plainto_tsquery('english', $${paramIndex})
                  OR LOWER(name) LIKE LOWER($${paramIndex + 1})
                )
            `;
            params.push(query as string, `%${query}%`);
            paramIndex += 2;
        }

        if (schedule_type) {
            searchQuery += ` AND schedule_type = $${paramIndex}`;
            params.push(schedule_type as string);
            paramIndex++;
        }

        if (is_ayurvedic !== undefined) {
            searchQuery += ` AND is_ayurvedic = $${paramIndex}`;
            params.push(is_ayurvedic === 'true');
            paramIndex++;
        }

        // Add category filter
        if (category) {
            searchQuery += ` AND LOWER(category) = LOWER($${paramIndex})`;
            params.push(category as string);
            paramIndex++;
        }

        if (is_emergency !== undefined) {
            searchQuery += ` AND is_emergency_available = $${paramIndex}`;
            params.push(is_emergency === 'true');
            paramIndex++;
        }

        if (query) {
            searchQuery += ` ORDER BY relevance DESC, name`;
        } else {
            searchQuery += ` ORDER BY name`;
        }

        searchQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(Number(limit), offset);

        const result = await pool.query(searchQuery, params);

        // Get total count
        let countQuery = `SELECT COUNT(*) FROM medicines WHERE is_active = TRUE AND image_url IS NOT NULL AND image_url != ''`;
        const countParams: (string | boolean | number)[] = [];
        let countParamIndex = 1;

        if (query) {
            countQuery += `
              AND (
                to_tsvector('english', name || ' ' || COALESCE(generic_name, '') || ' ' || COALESCE(salt_composition, '')) 
                @@ plainto_tsquery('english', $${countParamIndex})
                OR LOWER(name) LIKE LOWER($${countParamIndex + 1})
              )
            `;
            countParams.push(query as string, `%${query}%`);
            countParamIndex += 2;
        }

        if (schedule_type) {
            countQuery += ` AND schedule_type = $${countParamIndex}`;
            countParams.push(schedule_type as string);
            countParamIndex++;
        }

        if (category) {
            countQuery += ` AND LOWER(category) = LOWER($${countParamIndex})`;
            countParams.push(category as string);
            countParamIndex++;
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count, 10);

        const response: PaginatedResponse<Medicine> = {
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        };

        // Cache for 5 minutes
        await setCache(cacheKey, response, 300);

        res.json({ success: true, ...response });
    } catch (error) {
        next(error);
    }
}

/**
 * Get medicine by ID
 */
export async function getMedicineById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM medicines WHERE id = $1 AND is_active = TRUE`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Medicine not found' });
            return;
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
}

/**
 * Get generic alternative for a medicine
 */
export async function getGenericAlternative(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        // Get original medicine
        const original = await pool.query(
            'SELECT salt_composition, mrp FROM medicines WHERE id = $1',
            [id]
        );

        if (original.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Medicine not found' });
            return;
        }

        const { salt_composition, mrp } = original.rows[0];

        if (!salt_composition) {
            res.json({ success: true, data: null, message: 'No salt composition for comparison' });
            return;
        }

        // Find cheapest generic with same salt
        const result = await pool.query(
            `SELECT id, name, manufacturer, mrp as price
       FROM medicines 
       WHERE salt_composition = $1 
         AND id != $2
         AND is_active = TRUE
       ORDER BY mrp ASC
       LIMIT 1`,
            [salt_composition, id]
        );

        if (result.rows.length === 0) {
            res.json({ success: true, data: null, message: 'No generic alternative available' });
            return;
        }

        const generic = result.rows[0];
        const savings = mrp - generic.price;
        const savingsPercent = Math.round((savings / mrp) * 100);

        const alternative: GenericAlternative = {
            id: generic.id,
            name: generic.name,
            manufacturer: generic.manufacturer,
            price: generic.price,
            savings,
            savings_percent: savingsPercent,
        };

        res.json({ success: true, data: alternative });
    } catch (error) {
        next(error);
    }
}

/**
 * Get medicines by category
 */
export async function getMedicinesByCategory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const result = await pool.query(
            `SELECT * FROM medicines 
       WHERE LOWER(category) = LOWER($1) 
         AND is_active = TRUE
         AND image_url IS NOT NULL AND image_url != ''
       ORDER BY name
       LIMIT $2 OFFSET $3`,
            [category, limit, offset]
        );

        const countResult = await pool.query(
            "SELECT COUNT(*) FROM medicines WHERE LOWER(category) = LOWER($1) AND is_active = TRUE AND image_url IS NOT NULL AND image_url != ''",
            [category]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count, 10),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / Number(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get all categories
 */
export async function getCategories(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const cached = await getCache<string[]>('categories');
        if (cached) {
            res.json({ success: true, data: cached });
            return;
        }

        const result = await pool.query(
            `SELECT DISTINCT category, COUNT(*) as count 
       FROM medicines 
       WHERE category IS NOT NULL AND is_active = TRUE
       GROUP BY category
       ORDER BY count DESC`
        );

        const categories = result.rows;
        await setCache('categories', categories, 3600); // Cache 1 hour

        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
}

/**
 * Get Ayurvedic medicines
 */
export async function getAyurvedicMedicines(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        const result = await pool.query(
            `SELECT * FROM medicines 
       WHERE is_ayurvedic = TRUE AND is_active = TRUE
       AND image_url IS NOT NULL AND image_url != ''
       ORDER BY name
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            "SELECT COUNT(*) FROM medicines WHERE is_ayurvedic = TRUE AND is_active = TRUE AND image_url IS NOT NULL AND image_url != ''"
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: parseInt(countResult.rows[0].count, 10),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / Number(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
}
