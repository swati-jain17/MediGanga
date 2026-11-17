import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { initiatePhonePePayment } from '../services/payment.service.js';
import { env } from '../config/env.js';

/**
 * Subscription Controller
 * Handles membership plans (Plus/Max)
 */

// Get all available subscription plans
export async function getPlans(_req: Request, res: Response) {
    try {
        const result = await db.query(`
            SELECT id, name, display_name, description, price_monthly, price_yearly,
                   free_delivery_min_cart, video_consult_credits, features, badge_color
            FROM subscription_plans
            WHERE is_active = TRUE
            ORDER BY price_monthly ASC
        `);

        res.json({
            success: true,
            data: result.rows.map(plan => ({
                ...plan,
                features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
            }))
        });
    } catch (error: any) {
        console.error('Get plans error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch plans' });
    }
}

// Get user's current subscription
export async function getMySubscription(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await db.query(`
            SELECT us.*, sp.name as plan_name, sp.display_name, sp.badge_color,
                   sp.free_delivery_min_cart, sp.video_consult_credits,
                   sp.features
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = $1 AND us.status = 'active' AND us.expires_at > NOW()
            ORDER BY us.created_at DESC
            LIMIT 1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.json({ success: true, data: null, message: 'No active subscription' });
        }

        // Get video consult credits for this period
        const creditsResult = await db.query(`
            SELECT credits_total, credits_used, period_end
            FROM video_consult_credits
            WHERE user_id = $1 AND period_end >= CURRENT_DATE
            ORDER BY period_end DESC
            LIMIT 1
        `, [userId]);

        const subscription = result.rows[0];
        res.json({
            success: true,
            data: {
                ...subscription,
                features: typeof subscription.features === 'string'
                    ? JSON.parse(subscription.features)
                    : subscription.features,
                videoCredits: creditsResult.rows[0] || { credits_total: 0, credits_used: 0 }
            }
        });
    } catch (error: any) {
        console.error('Get subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch subscription' });
    }
}

// Subscribe to a plan
export async function subscribe(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { planId, billingCycle = 'monthly', paymentId, paymentMethod } = req.body;

        // Get plan details
        const planResult = await db.query(
            'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = TRUE',
            [planId]
        );

        if (planResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        const plan = planResult.rows[0];

        // Calculate expiry date
        const expiresAt = new Date();
        if (billingCycle === 'yearly') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Check for payment
        if (paymentMethod === 'phonepe' && !paymentId) {
            const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
            // Generate transaction ID
            const transactionId = `SUB_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

            const paymentResult = await initiatePhonePePayment(
                amount,
                planId, // Use planId or a temp order id
                userId,
                '9999999999', // TODO: Get user phone
                {
                    redirectUrl: `${env.frontendUrl}/membership?source=phonepe&transactionId=${transactionId}&planId=${planId}`,
                    callbackUrl: `${env.frontendUrl}/api/subscription/payment/callback/phonepe`,
                    merchantTransactionId: transactionId
                }
            );

            if (paymentResult.success) {
                return res.json({
                    success: true,
                    data: {
                        redirectUrl: paymentResult.data.redirectUrl,
                        transactionId
                    },
                    message: 'Redirecting to payment...'
                });
            } else {
                return res.status(400).json({ success: false, error: 'Payment initiation failed' });
            }
        }

        // Cancel any existing active subscription
        await db.query(`
            UPDATE user_subscriptions 
            SET status = 'cancelled', updated_at = NOW()
            WHERE user_id = $1 AND status = 'active'
        `, [userId]);

        // Create new subscription
        const subResult = await db.query(`
            INSERT INTO user_subscriptions (user_id, plan_id, billing_cycle, expires_at, payment_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, planId, billingCycle, expiresAt, paymentId || `mock_${Date.now()}`]);

        // If Max plan, create video consult credits
        if (plan.video_consult_credits > 0) {
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            await db.query(`
                INSERT INTO video_consult_credits (user_id, credits_total, credits_used, period_start, period_end)
                VALUES ($1, $2, 0, CURRENT_DATE, $3)
            `, [userId, plan.video_consult_credits, periodEnd]);
        }

        // Award signup bonus points
        await db.query(`
            INSERT INTO loyalty_points (user_id, points_balance, points_earned_total)
            VALUES ($1, 100, 100)
            ON CONFLICT (user_id) DO UPDATE SET 
                points_balance = loyalty_points.points_balance + 100,
                points_earned_total = loyalty_points.points_earned_total + 100
        `, [userId]);

        await db.query(`
            INSERT INTO loyalty_transactions (user_id, points, type, source, description)
            VALUES ($1, 100, 'bonus', 'subscription', $2)
        `, [userId, `Subscription bonus for ${plan.display_name}`]);

        res.json({
            success: true,
            data: subResult.rows[0],
            message: `Successfully subscribed to ${plan.display_name}!`
        });
    } catch (error: any) {
        console.error('Subscribe error:', error);
        res.status(500).json({ success: false, error: 'Failed to subscribe' });
    }
}

// Cancel subscription
export async function cancelSubscription(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await db.query(`
            UPDATE user_subscriptions 
            SET status = 'cancelled', auto_renew = FALSE, updated_at = NOW()
            WHERE user_id = $1 AND status = 'active'
            RETURNING *
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'No active subscription found' });
        }

        res.json({
            success: true,
            message: 'Subscription cancelled. You can still use benefits until the end of your billing period.'
        });
    } catch (error: any) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
    }
}

// Check if user has free delivery
export async function checkFreeDelivery(userId: string, cartTotal: number): Promise<boolean> {
    try {
        const result = await db.query(`
            SELECT sp.free_delivery_min_cart
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.plan_id = sp.id
            WHERE us.user_id = $1 AND us.status = 'active' AND us.expires_at > NOW()
            LIMIT 1
        `, [userId]);

        if (result.rows.length === 0) {
            return false; // No subscription
        }

        const minCart = result.rows[0].free_delivery_min_cart;

        // Max plan has null minCart (no minimum)
        if (minCart === null) {
            return true;
        }

        // Plus plan checks minimum cart value
        return cartTotal >= parseFloat(minCart);
    } catch (error) {
        console.error('Check free delivery error:', error);
        return false;
    }
}

// Use video consult credit
export async function useVideoCredit(userId: string): Promise<{ success: boolean; message: string }> {
    try {
        const result = await db.query(`
            UPDATE video_consult_credits
            SET credits_used = credits_used + 1
            WHERE user_id = $1 
              AND period_end >= CURRENT_DATE
              AND credits_used < credits_total
            RETURNING *
        `, [userId]);

        if (result.rows.length === 0) {
            return { success: false, message: 'No available video credits' };
        }

        return { success: true, message: 'Video credit used successfully' };
    } catch (error) {
        console.error('Use video credit error:', error);
        return { success: false, message: 'Failed to use credit' };
    }
}
