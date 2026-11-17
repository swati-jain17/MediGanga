import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
    connectionString: env.databaseUrl,
    max: 20, // Maximum connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: env.isProduction ? { rejectUnauthorized: false } : undefined,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Database connected');
});

pool.on('error', (err) => {
    console.error('❌ Database error:', err);
});

// Helper for transactions
export async function withTransaction<T>(
    callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export default pool;

// Alias for convenience
export const db = pool;

