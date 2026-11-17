import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import type { AuthPayload } from '../types/index.js';
import { sendEmail } from '../services/notification.service.js';

/**
 * Register a new user with email/password
 */
export async function register(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email, password, name, phone } = req.body;

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name, phone) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, email, name, phone, profile_picture, health_profile, created_at`,
            [email, passwordHash, name || null, phone || null]
        );

        const user = result.rows[0];

        // Send Welcome Email
        try {
            await sendEmail(
                email,
                'Welcome to MediGanga! 🌿',
                `<h1>Welcome, ${name || 'User'}!</h1><p>Thank you for registering with MediGanga. We are here to serve all your healthcare needs.</p>`
            );
        } catch (err) {
            console.error('Failed to send welcome email:', err);
        }

        // Generate JWT
        const payload: AuthPayload = {
            userId: user.id,
            phone: user.phone || '',
        };

        const token = generateToken(payload);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    profile_picture: user.profile_picture,
                },
                isNewUser: true,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Login with email/password
 */
export async function login(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email, password } = req.body;

        // Find user by email
        const result = await pool.query(
            'SELECT id, email, name, phone, password_hash, profile_picture, health_profile, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
            return;
        }

        const user = result.rows[0];

        // Check if user has a password (might be old OTP-only user)
        if (!user.password_hash) {
            res.status(401).json({
                success: false,
                error: 'Please register with a password'
            });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
            return;
        }

        // Generate JWT
        const payload: AuthPayload = {
            userId: user.id,
            phone: user.phone || '',
        };

        const token = generateToken(payload);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    profile_picture: user.profile_picture,
                    role: user.role,
                },
                isNewUser: false,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get current user profile
 */
export async function getProfile(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;

        const result = await pool.query(
            'SELECT id, phone, name, email, profile_picture, health_profile, role, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update user profile
 */
export async function updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { name, email, phone, profile_picture, health_profile } = req.body;

        const result = await pool.query(
            `UPDATE users 
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           profile_picture = COALESCE($5, profile_picture),
           health_profile = COALESCE($6, health_profile)
       WHERE id = $1
       RETURNING id, phone, name, email, profile_picture, health_profile`,
            [userId, name, email, phone, profile_picture, health_profile ? JSON.stringify(health_profile) : null]
        );

        res.json({
            success: true,
            data: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Verify Aadhaar for Schedule X medicines
 */
export async function verifyAadhaar(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { aadhaar } = req.body;

        // Validate Aadhaar format (12 digits)
        if (!/^\d{12}$/.test(aadhaar)) {
            res.status(400).json({
                success: false,
                error: 'Invalid Aadhaar number format'
            });
            return;
        }

        // Hash Aadhaar for storage (never store plain Aadhaar)
        const aadhaarHash = await bcrypt.hash(aadhaar, 10);

        await pool.query(
            'UPDATE users SET aadhaar_hash = $2 WHERE id = $1',
            [userId, aadhaarHash]
        );

        res.json({
            success: true,
            message: 'Aadhaar verified successfully',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Forgot Password - Send Reset Link
 */
export async function forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { email } = req.body;

        const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // Do not reveal user existence
            res.json({ success: true, message: 'If account exists, email sent.' });
            return;
        }

        const user = result.rows[0];

        // Generate a simple reusable token based on secret + time (In prod, store in DB/Redis with expiry)
        // For simplicity here, we'll create a short-lived JWT specifically for reset
        const resetToken = generateToken({ userId: user.id, phone: '' }, '15m'); // 15 mins expiry

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        try {
            await sendEmail(
                email,
                'MediGanga Password Reset',
                `<p>Hi ${user.name},</p><p>Click here to reset your password: <a href="${resetLink}">Reset Password</a></p><p>Valid for 15 minutes.</p>`
            );
        } catch (err) {
            console.error("Failed to send reset email:", err);
            // Still return success to user
        }

        res.json({ success: true, message: 'If account exists, email sent.' });
    } catch (error) {
        next(error);
    }
}

/**
 * Reset Password
 */
export async function resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { token, newPassword } = req.body;

        // Verify token
        let decoded: AuthPayload;
        try {
            decoded = verifyToken(token);
        } catch (e) {
            res.status(400).json({ success: false, error: 'Invalid or expired token' });
            return;
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password_hash = $2 WHERE id = $1',
            [decoded.userId, passwordHash]
        );

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
}
