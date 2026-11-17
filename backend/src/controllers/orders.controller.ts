import { Request, Response, NextFunction } from 'express';
import pool, { withTransaction } from '../config/database.js';
import { findNearestDarkStore, calculateDeliveryETA } from '../services/geofence.service.js';
import { checkInteractions } from '../services/interaction.service.js';
import { createPaymentOrder, verifyPaymentSignature, initiatePhonePePayment, verifyPhonePePayment } from '../services/payment.service.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../services/notification.service.js';
import type { CreateOrderRequest, OrderStatus } from '../types/index.js';

/**
 * Create a new order
 */
export async function createOrder(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const {
            items,
            deliveryAddress,
            deliveryLocation,
            prescriptionId,
            acknowledgedInteractions
        } = req.body as CreateOrderRequest;

        // 1. Check prescription requirement for Schedule H/H1/X medicines
        const medicineIds = items.map(i => i.medicineId);
        const scheduleCheck = await pool.query(
            `SELECT id, name, schedule_type FROM medicines WHERE id = ANY($1) AND schedule_type IN ('H', 'H1', 'X')`,
            [medicineIds]
        );

        const requiresPrescription = scheduleCheck.rows.length > 0;

        if (requiresPrescription && !prescriptionId) {
            res.status(400).json({
                success: false,
                error: 'Prescription required',
                code: 'PRESCRIPTION_REQUIRED',
                scheduledMedicines: scheduleCheck.rows.map(r => r.name),
            });
            return;
        }

        // 2. Verify prescription if provided
        if (prescriptionId) {
            const prescription = await pool.query(
                'SELECT is_expired, pharmacist_verified FROM prescriptions WHERE id = $1 AND user_id = $2',
                [prescriptionId, userId]
            );

            if (prescription.rows.length === 0) {
                res.status(404).json({ success: false, error: 'Prescription not found' });
                return;
            }

            if (prescription.rows[0].is_expired) {
                res.status(400).json({
                    success: false,
                    error: 'Prescription expired (valid for 30 days only)',
                    code: 'PRESCRIPTION_EXPIRED'
                });
                return;
            }

            if (!prescription.rows[0].pharmacist_verified) {
                res.status(400).json({
                    success: false,
                    error: 'Prescription pending verification',
                    code: 'PRESCRIPTION_PENDING'
                });
                return;
            }
        }

        // 3. Check drug interactions
        const interactions = await checkInteractions(medicineIds);
        const hasContraindicated = interactions.some(i => i.severity === 'CONTRAINDICATED');
        const hasMajor = interactions.some(i => i.severity === 'MAJOR');

        if (hasContraindicated) {
            res.status(400).json({
                success: false,
                error: 'Dangerous drug combination detected',
                code: 'CONTRAINDICATED',
                interactions: interactions.filter(i => i.severity === 'CONTRAINDICATED'),
            });
            return;
        }

        if (hasMajor && !acknowledgedInteractions) {
            res.status(400).json({
                success: false,
                error: 'Major drug interactions require acknowledgment',
                code: 'MAJOR_INTERACTION',
                interactions: interactions.filter(i => i.severity === 'MAJOR'),
                requiresAcknowledgment: true,
            });
            return;
        }

        // 4. Find nearest dark store
        const darkStore = await findNearestDarkStore(deliveryLocation);

        // 5. Check inventory availability
        const inventoryCheck = await pool.query(
            `SELECT m.id, m.name, i.stock_quantity 
       FROM medicines m
       LEFT JOIN inventory i ON m.id = i.medicine_id AND i.dark_store_id = $1
       WHERE m.id = ANY($2)`,
            [darkStore.id, medicineIds]
        );

        const unavailable = inventoryCheck.rows.filter(r => {
            const item = items.find(i => i.medicineId === r.id);
            return !r.stock_quantity || r.stock_quantity < (item?.quantity ?? 0);
        });

        if (unavailable.length > 0) {
            res.status(400).json({
                success: false,
                error: 'Some items are out of stock',
                code: 'OUT_OF_STOCK',
                unavailable: unavailable.map(r => r.name),
            });
            return;
        }

        // 6. Calculate pricing
        let subtotal = 0;
        let genericSavings = 0;

        for (const item of items) {
            const medicine = await pool.query(
                'SELECT mrp, generic_mrp FROM medicines WHERE id = $1',
                [item.medicineId]
            );

            if (medicine.rows.length > 0) {
                subtotal += item.price * item.quantity;
                if (item.isGeneric && medicine.rows[0].generic_mrp) {
                    genericSavings += (medicine.rows[0].mrp - medicine.rows[0].generic_mrp) * item.quantity;
                }
            }
        }

        // Check for active subscription for free delivery
        const subscription = await pool.query(
            "SELECT id FROM user_subscriptions WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()",
            [userId]
        );

        const deliveryFee = (subtotal >= 1500 || subscription.rows.length > 0) ? 0 : 29;
        const totalAmount = subtotal + deliveryFee;

        // 7. Calculate ETA
        const eta = calculateDeliveryETA(
            { latitude: darkStore.latitude, longitude: darkStore.longitude },
            deliveryLocation
        );
        const estimatedDelivery = new Date(Date.now() + eta.minutes * 60 * 1000);

        // 8. Create order in transaction
        const order = await withTransaction(async (client) => {
            // Insert order
            const orderResult = await client.query(
                `INSERT INTO orders (
          user_id, dark_store_id, prescription_id, delivery_address,
          delivery_longitude, delivery_latitude, subtotal, delivery_fee, total_amount, generic_savings,
          estimated_delivery, interaction_warnings_acknowledged, requires_prescription
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
                [
                    userId, darkStore.id, prescriptionId || null, deliveryAddress,
                    deliveryLocation.longitude, deliveryLocation.latitude,
                    subtotal, deliveryFee, totalAmount, genericSavings,
                    estimatedDelivery, acknowledgedInteractions || false, requiresPrescription
                ]
            );

            const orderId = orderResult.rows[0].id;
            let hasEmergencyItems = false;

            // Insert order items
            for (const item of items) {
                const medicine = await client.query(
                    'SELECT name, is_emergency_available FROM medicines WHERE id = $1',
                    [item.medicineId]
                );

                await client.query(
                    `INSERT INTO order_items (order_id, medicine_id, medicine_name, quantity, unit_price, total_price, is_generic)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [orderId, item.medicineId, medicine.rows[0]?.name || 'Unknown', item.quantity, item.price, item.price * item.quantity, item.isGeneric]
                );

                // Reduce inventory
                await client.query(
                    `UPDATE inventory SET stock_quantity = stock_quantity - $1, last_updated = NOW()
           WHERE medicine_id = $2 AND dark_store_id = $3`,
                    [item.quantity, item.medicineId, darkStore.id]
                );

                if (medicine.rows[0]?.is_emergency_available) {
                    hasEmergencyItems = true;
                }
            }

            // Create Emergency Order entry if needed
            if (hasEmergencyItems) {
                await client.query(
                    `INSERT INTO emergency_orders (order_id, priority_level, surge_fee, estimated_delivery_minutes)
                     VALUES ($1, 'critical', 0, 30)`,
                    [orderId]
                );
            }

            // Log interaction warnings
            for (const interaction of interactions) {
                await client.query(
                    `INSERT INTO interaction_warnings (order_id, medicine_a_id, medicine_b_id, medicine_a_name, medicine_b_name, severity, description, user_acknowledged)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [orderId, interaction.medicineAId, interaction.medicineBId, interaction.medicineA, interaction.medicineB, interaction.severity, interaction.description, acknowledgedInteractions || false]
                );
            }

            return { id: orderId, estimatedDelivery, totalAmount, genericSavings };
        });

        // 9. Send confirmation
        const user = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);
        if (user.rows.length > 0) {
            await sendOrderConfirmation(user.rows[0].phone, order.id, eta.minutes);
        }

        res.status(201).json({
            success: true,
            data: {
                orderId: order.id,
                totalAmount: order.totalAmount,
                genericSavings: order.genericSavings,
                estimatedDelivery: order.estimatedDelivery,
                estimatedMinutes: eta.minutes,
                darkStore: {
                    name: darkStore.name,
                    address: darkStore.address,
                },
                interactions: interactions.filter(i => i.severity !== 'MINOR'),
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get order by ID
 */
export async function getOrderById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;

        const orderResult = await pool.query(
            `SELECT o.*, 
              ds.name as dark_store_name, ds.address as dark_store_address, ds.phone as dark_store_phone
       FROM orders o
       JOIN dark_stores ds ON o.dark_store_id = ds.id
       WHERE o.id = $1 AND o.user_id = $2`,
            [id, userId]
        );

        if (orderResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(
            `SELECT oi.*, m.image_url, m.schedule_type
       FROM order_items oi
       LEFT JOIN medicines m ON oi.medicine_id = m.id
       WHERE oi.order_id = $1`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...order,
                items: itemsResult.rows,
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get user's orders
 */
export async function getUserOrders(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
      SELECT o.id, o.status, o.total_amount, o.generic_savings, o.created_at, o.delivered_at,
             ds.name as dark_store_name,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      JOIN dark_stores ds ON o.dark_store_id = ds.id
      WHERE o.user_id = $1
    `;

        const params: (string | number)[] = [userId];

        if (status) {
            query += ` AND o.status = $${params.length + 1}`;
            params.push(status as string);
        }

        query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(Number(limit), offset);

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Update order status (for delivery partners)
 */
export async function updateOrderStatus(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const { status } = req.body as { status: OrderStatus };

        const validTransitions: Record<string, string[]> = {
            placed: ['verified', 'cancelled'],
            verified: ['preparing', 'cancelled'],
            preparing: ['ready_for_pickup', 'cancelled'],
            ready_for_pickup: ['out_for_delivery', 'cancelled'],
            out_for_delivery: ['delivered', 'cancelled'],
        };

        // Get current status
        const currentOrder = await pool.query(
            'SELECT status, user_id FROM orders WHERE id = $1',
            [id]
        );

        if (currentOrder.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        const currentStatus = currentOrder.rows[0].status;

        if (!validTransitions[currentStatus]?.includes(status)) {
            res.status(400).json({
                success: false,
                error: `Cannot transition from ${currentStatus} to ${status}`
            });
            return;
        }

        // Update status
        const updateFields: Record<string, unknown> = { status };
        if (status === 'delivered') {
            updateFields.delivered_at = new Date();
        } else if (status === 'preparing') {
            updateFields.prepared_at = new Date();
        } else if (status === 'out_for_delivery') {
            updateFields.picked_up_at = new Date();
        }

        await pool.query(
            `UPDATE orders SET status = $1, delivered_at = $2, updated_at = NOW() WHERE id = $3`,
            [status, status === 'delivered' ? new Date() : null, id]
        );

        // Notify user
        const user = await pool.query('SELECT phone FROM users WHERE id = $1', [currentOrder.rows[0].user_id]);
        if (user.rows.length > 0) {
            await sendOrderStatusUpdate(user.rows[0].phone, id, status);
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Cancel order
 */
export async function cancelOrder(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user!.userId;
        const { reason } = req.body;

        const order = await pool.query(
            'SELECT status FROM orders WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (order.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        if (!['placed', 'verified'].includes(order.rows[0].status)) {
            res.status(400).json({
                success: false,
                error: 'Order cannot be cancelled at this stage'
            });
            return;
        }

        await pool.query(
            `UPDATE orders SET status = 'cancelled', cancel_reason = $1, updated_at = NOW() WHERE id = $2`,
            [reason, id]
        );

        console.log(`✅ Order ${id} cancelled by user ${userId}`);

        res.json({
            success: true,
            message: 'Order cancelled successfully',
        });
    } catch (error) {
        console.error('❌ Cancel Error:', error);
        next(error);
    }
}

/**
 * Create payment order (Razorpay)
 */

/**
 * Create payment order (Razorpay / PhonePe)
 */
export async function initiatePayment(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { orderId, paymentMethod = 'razorpay' } = req.body;
        const userId = req.user!.userId;

        const order = await pool.query(
            `SELECT o.total_amount, o.payment_status, u.phone
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = $1 AND o.user_id = $2`,
            [orderId, userId]
        );

        if (order.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        if (order.rows[0].payment_status === 'paid') {
            res.status(400).json({ success: false, error: 'Order already paid' });
            return;
        }

        if (paymentMethod === 'phonepe') {
            const result = await initiatePhonePePayment(
                order.rows[0].total_amount,
                orderId,
                userId,
                order.rows[0].phone
            );

            if (!result.success) {
                res.status(400).json({ success: false, error: result.error });
                return;
            }

            res.json({
                success: true,
                data: result.data, // Contains redirectUrl
                method: 'phonepe'
            });
            return;
        }

        // Default: Razorpay
        const paymentOrder = await createPaymentOrder(order.rows[0].total_amount, orderId);

        res.json({
            success: true,
            data: paymentOrder,
            method: 'razorpay'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Verify payment
 */
import { awardOrderPoints } from './loyalty.controller.js';

// ... (existing imports)

// ...

export async function verifyPayment(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const isValid = verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!isValid) {
            res.status(400).json({ success: false, error: 'Payment verification failed' });
            return;
        }

        // Get order details for loyalty points
        const orderResult = await pool.query(
            'SELECT user_id, total_amount, payment_status FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        const order = orderResult.rows[0];

        // Update payment status
        await pool.query(
            `UPDATE orders SET payment_status = 'paid', payment_id = $1, updated_at = NOW() WHERE id = $2`,
            [razorpay_payment_id, orderId]
        );

        // Award loyalty points if not already paid
        if (order.payment_status !== 'paid') {
            await awardOrderPoints(order.user_id, order.total_amount, orderId);
        }


        res.json({
            success: true,
            message: 'Payment verified successfully',
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Check PhonePe Payment Status
 */
export async function checkPhonePeStatus(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { orderId } = req.params;
        const userId = req.user!.userId;

        // Verify order belongs to user
        const order = await pool.query(
            'SELECT id, payment_status, total_amount, user_id FROM orders WHERE id = $1 AND user_id = $2',
            [orderId, userId]
        );

        if (order.rows.length === 0) {
            res.status(404).json({ success: false, error: 'Order not found' });
            return;
        }

        if (order.rows[0].payment_status === 'paid') {
            res.json({ success: true, status: 'paid' });
            return;
        }

        // Check Status with PhonePe
        // Transaction ID format used in initiate: TXN_${orderId}_... 
        // We need to store the specific transaction ID or search for it. 
        // For simplicity, we'll construct the prefix and try to find the latest or store it in DB.
        // A better approach is to store the transaction_id in orders table when initiating.
        // But since we didn't add a column, let's assume we can't easily guess the timestamp.
        // Wait, correct implementation should save `merchantTransactionId` in DB or passed from frontend?
        // Frontend receives `transactionId` in initiate response. Frontend can pass it back.

        const { transactionId } = req.query; // Expect transactionId from query params

        if (!transactionId || typeof transactionId !== 'string') {
            res.status(400).json({ success: false, error: 'Transaction ID required' });
            return;
        }

        const result = await verifyPhonePePayment(transactionId);

        if (result.success && result.status === 'paid') {
            const orderData = order.rows[0];
            // Update payment status
            await pool.query(
                `UPDATE orders SET payment_status = 'paid', payment_id = $1, updated_at = NOW() WHERE id = $2`,
                [transactionId, orderId]
            );

            // Award loyalty points
            await awardOrderPoints(orderData.user_id, orderData.total_amount, orderId);

            res.json({ success: true, status: 'paid' });
        } else {
            res.json({ success: false, status: result.status });
        }

    } catch (error) {
        next(error);
    }
}
