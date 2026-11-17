import { Request, Response } from 'express';
import { db } from '../config/database.js';

/**
 * Loyalty Controller
 * Handles GangaPoints - earning, redeeming, and adherence streaks
 */

// Get user's loyalty points balance and history
export async function getBalance(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Get or create loyalty points record
        let pointsResult = await db.query(
            'SELECT * FROM loyalty_points WHERE user_id = $1',
            [userId]
        );

        if (pointsResult.rows.length === 0) {
            // Initialize loyalty points for new user
            await db.query(`
                INSERT INTO loyalty_points (user_id, points_balance, points_earned_total)
                VALUES ($1, 0, 0)
            `, [userId]);
            pointsResult = await db.query(
                'SELECT * FROM loyalty_points WHERE user_id = $1',
                [userId]
            );
        }

        // Get recent transactions
        const transactionsResult = await db.query(`
            SELECT * FROM loyalty_transactions
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 20
        `, [userId]);

        // Get adherence streak
        const streakResult = await db.query(
            'SELECT * FROM adherence_streaks WHERE user_id = $1',
            [userId]
        );

        // Calculate progress to next reward
        const balance = pointsResult.rows[0].points_balance;
        const nextRewardAt = Math.ceil(balance / 50) * 50 + 50; // Next 50-point milestone
        const pointsToNextReward = nextRewardAt - balance;

        res.json({
            success: true,
            data: {
                balance: pointsResult.rows[0].points_balance,
                totalEarned: pointsResult.rows[0].points_earned_total,
                totalRedeemed: pointsResult.rows[0].points_redeemed_total,
                streak: streakResult.rows[0] || { current_streak: 0, longest_streak: 0 },
                transactions: transactionsResult.rows,
                rewards: {
                    nextRewardAt,
                    pointsToNextReward,
                    rewardValue: nextRewardAt // 50 points = ₹50
                }
            }
        });
    } catch (error: any) {
        console.error('Get balance error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch loyalty balance' });
    }
}

// Award points for order (called internally after order completion)
export async function awardOrderPoints(userId: string, orderTotal: number, orderId: string) {
    try {
        // 1 point per ₹100 spent
        const pointsEarned = Math.floor(orderTotal / 100);

        if (pointsEarned <= 0) return;

        // Update balance
        await db.query(`
            INSERT INTO loyalty_points (user_id, points_balance, points_earned_total)
            VALUES ($1, $2, $2)
            ON CONFLICT (user_id) DO UPDATE SET 
                points_balance = loyalty_points.points_balance + $2,
                points_earned_total = loyalty_points.points_earned_total + $2,
                updated_at = NOW()
        `, [userId, pointsEarned]);

        // Record transaction
        await db.query(`
            INSERT INTO loyalty_transactions (user_id, points, type, source, reference_id, description)
            VALUES ($1, $2, 'earned', 'order', $3, $4)
        `, [userId, pointsEarned, orderId, `Earned ${pointsEarned} points on order`]);

        return pointsEarned;
    } catch (error) {
        console.error('Award order points error:', error);
        return 0;
    }
}

// Redeem points for discount
export async function redeemPoints(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { points } = req.body;

        if (!points || points < 50) {
            return res.status(400).json({
                success: false,
                error: 'Minimum 50 points required for redemption'
            });
        }

        // Check balance
        const balanceResult = await db.query(
            'SELECT points_balance FROM loyalty_points WHERE user_id = $1',
            [userId]
        );

        if (balanceResult.rows.length === 0 || balanceResult.rows[0].points_balance < points) {
            return res.status(400).json({ success: false, error: 'Insufficient points' });
        }

        // Deduct points
        await db.query(`
            UPDATE loyalty_points
            SET points_balance = points_balance - $2,
                points_redeemed_total = points_redeemed_total + $2,
                updated_at = NOW()
            WHERE user_id = $1
        `, [userId, points]);

        // Record transaction
        await db.query(`
            INSERT INTO loyalty_transactions (user_id, points, type, source, description)
            VALUES ($1, $2, 'redeemed', 'checkout', $3)
        `, [userId, -points, `Redeemed ${points} points for ₹${points} discount`]);

        res.json({
            success: true,
            data: {
                pointsRedeemed: points,
                discountAmount: points, // 1 point = ₹1
                message: `₹${points} discount applied to your order!`
            }
        });
    } catch (error: any) {
        console.error('Redeem points error:', error);
        res.status(500).json({ success: false, error: 'Failed to redeem points' });
    }
}

// Record adherence (called when user marks "Taken" in reminder)
export async function recordAdherence(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const today = new Date().toISOString().split('T')[0];

        // Get or create streak record
        let streakResult = await db.query(
            'SELECT * FROM adherence_streaks WHERE user_id = $1',
            [userId]
        );

        let currentStreak = 1;
        let bonusPoints = 0;

        if (streakResult.rows.length === 0) {
            // First adherence record
            await db.query(`
                INSERT INTO adherence_streaks (user_id, current_streak, longest_streak, last_adherence_date, streak_started_at)
                VALUES ($1, 1, 1, $2, $2)
            `, [userId, today]);
        } else {
            const streak = streakResult.rows[0];
            const lastDate = new Date(streak.last_adherence_date);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Already recorded today
                return res.json({
                    success: true,
                    data: {
                        currentStreak: streak.current_streak,
                        message: 'Adherence already recorded for today'
                    }
                });
            } else if (diffDays === 1) {
                // Consecutive day - extend streak
                currentStreak = streak.current_streak + 1;
                const longestStreak = Math.max(currentStreak, streak.longest_streak);

                await db.query(`
                    UPDATE adherence_streaks
                    SET current_streak = $2, longest_streak = $3, last_adherence_date = $4, updated_at = NOW()
                    WHERE user_id = $1
                `, [userId, currentStreak, longestStreak, today]);

                // Bonus points for streaks (7-day milestone)
                if (currentStreak % 7 === 0) {
                    bonusPoints = 25;
                    await db.query(`
                        UPDATE loyalty_points
                        SET points_balance = points_balance + $2, points_earned_total = points_earned_total + $2
                        WHERE user_id = $1
                    `, [userId, bonusPoints]);

                    await db.query(`
                        INSERT INTO loyalty_transactions (user_id, points, type, source, description)
                        VALUES ($1, $2, 'bonus', 'adherence_streak', $3)
                    `, [userId, bonusPoints, `${currentStreak}-day adherence streak bonus!`]);
                }
            } else {
                // Streak broken
                currentStreak = 1;
                await db.query(`
                    UPDATE adherence_streaks
                    SET current_streak = 1, last_adherence_date = $2, streak_started_at = $2, updated_at = NOW()
                    WHERE user_id = $1
                `, [userId, today]);
            }
        }

        res.json({
            success: true,
            data: {
                currentStreak,
                bonusPoints,
                message: bonusPoints > 0
                    ? `🎉 ${currentStreak}-day streak! You earned ${bonusPoints} bonus points!`
                    : `Great job! Your streak is now ${currentStreak} days.`
            }
        });
    } catch (error: any) {
        console.error('Record adherence error:', error);
        res.status(500).json({ success: false, error: 'Failed to record adherence' });
    }
}

// Get available rewards/vouchers
export async function getRewards(_req: Request, res: Response) {
    try {
        const rewards = [
            { id: 'reward_50', points: 50, value: 50, description: '₹50 off on your next order' },
            { id: 'reward_100', points: 100, value: 100, description: '₹100 off on your next order' },
            { id: 'reward_200', points: 200, value: 250, description: '₹250 off on orders above ₹500' },
            { id: 'reward_500', points: 500, value: 750, description: '₹750 off on orders above ₹1000' },
        ];

        res.json({ success: true, data: rewards });
    } catch (error: any) {
        console.error('Get rewards error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch rewards' });
    }
}
