import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { createOrderSchema } from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';
import * as ordersController from '../controllers/orders.controller.js';
import { z } from 'zod';

const router = Router();

// Create order (protected)
router.post(
    '/',
    authenticate,
    validate(createOrderSchema),
    ordersController.createOrder
);

// Get user's orders
router.get(
    '/',
    authenticate,
    ordersController.getUserOrders
);

// Get order by ID
router.get(
    '/:id',
    authenticate,
    ordersController.getOrderById
);

// Update order status (delivery partner)
router.put(
    '/:id/status',
    authenticate,
    validate(z.object({
        status: z.enum(['verified', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'])
    })),
    ordersController.updateOrderStatus
);

// Cancel order
router.post(
    '/:id/cancel',
    authenticate,
    validate(z.object({ reason: z.string().max(500).optional() })),
    ordersController.cancelOrder
);

// Initiate payment
router.post(
    '/payment/initiate',
    authenticate,
    validate(z.object({ orderId: z.string().uuid() })),
    ordersController.initiatePayment
);

// Verify payment
router.post(
    '/payment/verify',
    authenticate,
    validate(z.object({
        orderId: z.string().uuid(),
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
    })),
    ordersController.verifyPayment
);

// Check PhonePe status
router.get(
    '/:orderId/payment/phonepe/status',
    authenticate,
    validate(z.object({
        transactionId: z.string()
    }), 'query'),
    ordersController.checkPhonePeStatus
);

export default router;
