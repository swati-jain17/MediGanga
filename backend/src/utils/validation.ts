import { z } from 'zod';

// Phone number validation (Indian format)
export const phoneSchema = z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number');

// Location validation
export const locationSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});

// Pagination validation
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Medicine search validation
export const medicineSearchSchema = z.object({
    query: z.string().min(1).max(100).optional(),
    category: z.string().max(100).optional(),
    schedule_type: z.enum(['OTC', 'H', 'H1', 'X']).optional(),
    is_ayurvedic: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Order creation validation
export const createOrderSchema = z.object({
    items: z.array(z.object({
        medicineId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(10),
        price: z.coerce.number().positive(),
        isGeneric: z.boolean().default(false),
    })).min(1),
    deliveryAddress: z.string().min(10).max(500),
    deliveryLocation: locationSchema,
    prescriptionId: z.string().uuid().optional(),
    acknowledgedInteractions: z.boolean().optional(),
});

// User registration validation
export const registerUserSchema = z.object({
    phone: phoneSchema,
    name: z.string().min(2).max(255).optional(),
    email: z.string().email().optional(),
});

// Email/Password Registration
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2).max(255).optional(),
});

// Email/Password Login
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// OTP verification (legacy - kept for compatibility)
export const verifyOtpSchema = z.object({
    phone: phoneSchema,
    otp: z.string().length(6),
});

// Drug interaction check
export const interactionCheckSchema = z.object({
    medicineIds: z.array(z.string().uuid()).min(2).max(20),
});

// Prescription upload
export const prescriptionSchema = z.object({
    issued_date: z.string().refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime()) && parsed <= new Date();
    }, 'Invalid or future date'),
});

// Chronic refill setup
export const chronicRefillSchema = z.object({
    medicine_id: z.string().uuid(),
    dosage_frequency: z.string().max(100).optional(),
    days_supply: z.number().int().min(7).max(90).optional(),
    auto_refill_enabled: z.boolean().default(true),
});

// User health profile update
export const healthProfileSchema = z.object({
    diabetes: z.boolean().optional(),
    hypertension: z.boolean().optional(),
    heart_disease: z.boolean().optional(),
    kidney_disease: z.boolean().optional(),
    allergies: z.array(z.string()).optional(),
    chronic_conditions: z.array(z.string()).optional(),
});
