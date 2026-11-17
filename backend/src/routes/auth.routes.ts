import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { registerSchema, loginSchema, healthProfileSchema } from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';
import { z } from 'zod';

const router = Router();

// Register with email/password
router.post(
    '/register',
    validate(registerSchema),
    authController.register
);

// Login with email/password
router.post(
    '/login',
    validate(loginSchema),
    authController.login
);

// Forgot Password
router.post(
    '/forgot-password',
    validate(z.object({ email: z.string().email() })),
    authController.forgotPassword
);

// Reset Password
router.post(
    '/reset-password',
    validate(z.object({ token: z.string(), newPassword: z.string().min(6) })),
    authController.resetPassword
);

// Get profile (protected)
router.get(
    '/profile',
    authenticate,
    authController.getProfile
);

// Update profile (protected)
router.put(
    '/profile',
    authenticate,
    validate(z.object({
        name: z.string().min(2).max(255).optional(),
        email: z.string().email().optional(),
        phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
        profile_picture: z.string().optional(),
        health_profile: healthProfileSchema.optional(),
    })),
    authController.updateProfile
);

// Verify Aadhaar (for Schedule X)
router.post(
    '/verify-aadhaar',
    authenticate,
    validate(z.object({ aadhaar: z.string().length(12) })),
    authController.verifyAadhaar
);

export default router;
