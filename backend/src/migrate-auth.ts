#!/usr/bin/env node
/**
 * Migration Script: Add password_hash column for email/password auth
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga'
    });

    try {
        console.log('🔄 Running email/password auth migration...');

        // Add password_hash column
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
        `);
        console.log('✅ Added password_hash column');

        // Make phone nullable
        try {
            await pool.query(`ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`);
            console.log('✅ Made phone column nullable');
        } catch (e: any) {
            console.log('ℹ️ phone column already nullable or constraint not found');
        }

        // Make email unique if not already
        try {
            await pool.query(`
                ALTER TABLE users 
                ADD CONSTRAINT users_email_unique UNIQUE (email)
            `);
            console.log('✅ Added unique constraint to email');
        } catch (e: any) {
            console.log('ℹ️ email unique constraint already exists');
        }

        // Create email index
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        console.log('✅ Created email index');

        console.log('\n🎉 Migration complete!\n');
    } catch (error: any) {
        console.error('❌ Migration error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
