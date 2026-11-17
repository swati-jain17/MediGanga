import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import pool from '../config/database.js';
import type { AuthPayload } from '../types/index.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload & { name?: string; email?: string; role?: string };
        }
    }
}

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            res.status(401).json({ success: false, error: 'No token provided' });
            return;
        }

        const payload = verifyToken(token);

        // Fetch fresh user data including role
        const result = await pool.query(
            'SELECT id, phone, name, email, role FROM users WHERE id = $1',
            [payload.userId]
        );

        if (result.rows.length === 0) {
            res.status(401).json({ success: false, error: 'User not found' });
            return;
        }

        req.user = {
            ...payload,
            name: result.rows[0].name,
            email: result.rows[0].email,
            role: result.rows[0].role,
        };

        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (token) {
            const payload = verifyToken(token);
            req.user = payload;
        }

        next();
    } catch {
        // Continue without user - token invalid but not required
        next();
    }
}

export function authorize(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            res.status(403).json({ success: false, error: 'Unauthorized: No role found' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: `Forbidden: Requires one of [${roles.join(', ')}] role`
            });
            return;
        }

        next();
    };
}

// Pharmacist role check (for prescription verification)
export async function requirePharmacist(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
    }

    // Check if user is a pharmacist (associated with a dark store)
    const result = await pool.query(
        `SELECT ds.id FROM dark_stores ds 
     JOIN users u ON ds.pharmacist_name = u.name 
     WHERE u.id = $1 AND ds.is_active = TRUE`,
        [req.user.userId]
    );

    if (result.rows.length === 0) {
        res.status(403).json({ success: false, error: 'Pharmacist role required' });
        return;
    }

    next();
}
