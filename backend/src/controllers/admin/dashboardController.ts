import { Request, Response } from 'express';
import pool from '../../config/database.js';

export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        // 1. Total & Today's Orders
        const ordersQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_orders,
        COUNT(CASE WHEN created_at >= date_trunc('week', CURRENT_DATE) THEN 1 END) as week_orders,
        SUM(CASE WHEN created_at >= CURRENT_DATE THEN total_amount ELSE 0 END) as today_revenue,
        SUM(total_amount) as total_revenue
      FROM orders
    `;
        const ordersResult = await pool.query(ordersQuery);

        // 2. Pending Prescriptions
        const prescriptionsQuery = `SELECT COUNT(*) as pending FROM prescriptions WHERE pharmacist_verified = FALSE AND is_expired = FALSE`;
        const prescriptionsResult = await pool.query(prescriptionsQuery);

        // 3. User Stats
        const usersQuery = `
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as new_users_today
            FROM users 
            WHERE role = 'customer'
        `;
        const usersResult = await pool.query(usersQuery);

        // 4. Low Stock Medicines
        const inventoryQuery = `SELECT COUNT(*) as low_stock FROM inventory WHERE stock_quantity <= 10`;
        const inventoryResult = await pool.query(inventoryQuery);

        res.json({
            success: true,
            data: {
                orders: {
                    total: parseInt(ordersResult.rows[0].total_orders),
                    today: parseInt(ordersResult.rows[0].today_orders),
                    week: parseInt(ordersResult.rows[0].week_orders),
                    todayRevenue: parseFloat(ordersResult.rows[0].today_revenue || 0),
                    totalRevenue: parseFloat(ordersResult.rows[0].total_revenue || 0)
                },
                prescriptions: {
                    pending: parseInt(prescriptionsResult.rows[0].pending)
                },
                users: {
                    total: parseInt(usersResult.rows[0].total_users),
                    newToday: parseInt(usersResult.rows[0].new_users_today)
                },
                inventory: {
                    lowStock: parseInt(inventoryResult.rows[0].low_stock)
                }
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
