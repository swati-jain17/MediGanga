import { Request, Response } from 'express';
import { db } from '../config/database.js';

/**
 * Reminders Controller
 * Handles medicine reminders, adherence logging, and inventory tracking
 */

// Get all reminders for user
export async function getReminders(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await db.query(`
            SELECT mr.*, m.mrp, m.pack_size, m.dosage_form
            FROM medicine_reminders mr
            LEFT JOIN medicines m ON mr.medicine_id = m.id
            WHERE mr.user_id = $1 AND mr.is_active = TRUE
            ORDER BY mr.schedule_time ASC
        `, [userId]);

        // Group by schedule period
        const grouped = {
            morning: result.rows.filter(r => r.schedule_period === 'morning'),
            afternoon: result.rows.filter(r => r.schedule_period === 'afternoon'),
            evening: result.rows.filter(r => r.schedule_period === 'evening'),
            night: result.rows.filter(r => r.schedule_period === 'night'),
        };

        res.json({ success: true, data: { reminders: result.rows, grouped } });
    } catch (error: any) {
        console.error('Get reminders error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch reminders' });
    }
}

// Create a new reminder
export async function createReminder(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const {
            medicineId,
            medicineName,
            dosage,
            scheduleTime,
            schedulePeriod,
            frequency = 'daily',
            daysOfWeek
        } = req.body;

        if (!medicineName || !scheduleTime) {
            return res.status(400).json({
                success: false,
                error: 'Medicine name and schedule time are required'
            });
        }

        const result = await db.query(`
            INSERT INTO medicine_reminders 
                (user_id, medicine_id, medicine_name, dosage, schedule_time, schedule_period, frequency, days_of_week)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [userId, medicineId, medicineName, dosage, scheduleTime, schedulePeriod, frequency, daysOfWeek]);

        res.json({
            success: true,
            data: result.rows[0],
            message: `Reminder set for ${medicineName} at ${scheduleTime}`
        });
    } catch (error: any) {
        console.error('Create reminder error:', error);
        res.status(500).json({ success: false, error: 'Failed to create reminder' });
    }
}

// Log reminder action (taken/skipped)
export async function logReminderAction(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { reminderId } = req.params;
        const { action } = req.body; // 'taken' or 'skipped'

        if (!['taken', 'skipped'].includes(action)) {
            return res.status(400).json({ success: false, error: 'Invalid action' });
        }

        // Log the action
        await db.query(`
            INSERT INTO reminder_logs (reminder_id, user_id, scheduled_at, action, recorded_at)
            VALUES ($1, $2, NOW(), $3, NOW())
        `, [reminderId, userId, action]);

        // If taken, update inventory
        if (action === 'taken') {
            const reminder = await db.query(
                'SELECT medicine_id, medicine_name FROM medicine_reminders WHERE id = $1',
                [reminderId]
            );

            if (reminder.rows[0]?.medicine_id) {
                await db.query(`
                    UPDATE user_inventory
                    SET used_quantity = used_quantity + 1, updated_at = NOW()
                    WHERE user_id = $1 AND medicine_id = $2
                `, [userId, reminder.rows[0].medicine_id]);
            }
        }

        res.json({
            success: true,
            message: action === 'taken' ? 'Great job! Medicine marked as taken.' : 'Skipped for today.'
        });
    } catch (error: any) {
        console.error('Log reminder action error:', error);
        res.status(500).json({ success: false, error: 'Failed to log action' });
    }
}

// Get today's reminder logs
export async function getTodayLogs(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await db.query(`
            SELECT rl.*, mr.medicine_name, mr.dosage, mr.schedule_time, mr.schedule_period
            FROM reminder_logs rl
            JOIN medicine_reminders mr ON rl.reminder_id = mr.id
            WHERE rl.user_id = $1 AND DATE(rl.scheduled_at) = CURRENT_DATE
            ORDER BY mr.schedule_time ASC
        `, [userId]);

        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('Get today logs error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch logs' });
    }
}

// Delete reminder
export async function deleteReminder(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        const { reminderId } = req.params;

        await db.query(
            'UPDATE medicine_reminders SET is_active = FALSE WHERE id = $1 AND user_id = $2',
            [reminderId, userId]
        );

        res.json({ success: true, message: 'Reminder deleted' });
    } catch (error: any) {
        console.error('Delete reminder error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete reminder' });
    }
}

// Get user inventory
export async function getInventory(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await db.query(`
            SELECT ui.*, m.mrp, m.pack_size, m.dosage_form, m.image_url,
                   (ui.total_quantity - ui.used_quantity) as remaining_quantity
            FROM user_inventory ui
            JOIN medicines m ON ui.medicine_id = m.id
            WHERE ui.user_id = $1
            ORDER BY (ui.total_quantity - ui.used_quantity) ASC
        `, [userId]);

        // Find low stock items
        const lowStock = result.rows.filter(item =>
            (item.total_quantity - item.used_quantity) <= item.low_stock_threshold
        );

        res.json({
            success: true,
            data: {
                inventory: result.rows,
                lowStock,
                lowStockCount: lowStock.length
            }
        });
    } catch (error: any) {
        console.error('Get inventory error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
    }
}

// Add medicine to inventory (after order)
export async function addToInventory(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { medicineId, medicineName, quantity, lowStockThreshold = 5 } = req.body;

        const result = await db.query(`
            INSERT INTO user_inventory (user_id, medicine_id, medicine_name, total_quantity, low_stock_threshold, last_refill_date)
            VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
            ON CONFLICT (user_id, medicine_id) DO UPDATE SET
                total_quantity = user_inventory.total_quantity + $4,
                last_refill_date = CURRENT_DATE,
                updated_at = NOW()
            RETURNING *
        `, [userId, medicineId, medicineName, quantity, lowStockThreshold]);

        res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('Add to inventory error:', error);
        res.status(500).json({ success: false, error: 'Failed to add to inventory' });
    }
}

// Get low stock medicines for auto-refill
export async function getLowStockForRefill(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const result = await db.query(`
            SELECT ui.*, m.id as medicine_id, m.name, m.mrp, m.pack_size,
                   (ui.total_quantity - ui.used_quantity) as remaining
            FROM user_inventory ui
            JOIN medicines m ON ui.medicine_id = m.id
            WHERE ui.user_id = $1 
              AND ui.auto_refill_enabled = TRUE
              AND (ui.total_quantity - ui.used_quantity) <= ui.low_stock_threshold
            ORDER BY (ui.total_quantity - ui.used_quantity) ASC
        `, [userId]);

        res.json({
            success: true,
            data: result.rows,
            message: result.rows.length > 0
                ? `${result.rows.length} medicine(s) running low!`
                : 'All medicines are well stocked'
        });
    } catch (error: any) {
        console.error('Get low stock error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch low stock items' });
    }
}
