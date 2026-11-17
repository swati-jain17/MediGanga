import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

interface ErrorWithStatus extends Error {
    status?: number;
    code?: string;
}

export function errorHandler(
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error(`❌ Error: ${err.message}`, {
        path: req.path,
        method: req.method,
        stack: env.isDevelopment ? err.stack : undefined,
    });

    // Zod validation errors
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
        return;
    }

    // Custom error codes
    if (err.code === 'PRESCRIPTION_REQUIRED') {
        res.status(400).json({
            success: false,
            error: 'Prescription required for Schedule H/H1/X medicines',
            code: err.code,
        });
        return;
    }

    if (err.code === 'PRESCRIPTION_EXPIRED') {
        res.status(400).json({
            success: false,
            error: 'Prescription expired (valid for 30 days only)',
            code: err.code,
        });
        return;
    }

    if (err.code === 'CONTRAINDICATED') {
        res.status(400).json({
            success: false,
            error: 'Contraindicated drug combination detected',
            code: err.code,
        });
        return;
    }

    if (err.code === 'OUT_OF_GEOFENCE') {
        res.status(400).json({
            success: false,
            error: 'No dark store available in your area',
            code: err.code,
        });
        return;
    }

    if (err.code === 'OUT_OF_STOCK') {
        res.status(400).json({
            success: false,
            error: 'Some items are out of stock',
            code: err.code,
        });
        return;
    }

    // PostgreSQL errors
    if (err.code === '23505') { // Unique violation
        res.status(409).json({
            success: false,
            error: 'Resource already exists',
        });
        return;
    }

    if (err.code === '23503') { // Foreign key violation
        res.status(400).json({
            success: false,
            error: 'Referenced resource does not exist',
        });
        return;
    }

    // Default error
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: env.isProduction ? 'Internal server error' : err.message,
    });
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
}
