#!/usr/bin/env node
/**
 * Reset and reseed database
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetDB() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

    const pool = new pg.Pool({ connectionString: dbUrl });

    try {
        console.log('🗑️  Dropping all tables...');

        // Drop all tables in public schema
        await pool.query(`
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        `);
        console.log('✅ Tables dropped');

        // Run schema
        console.log('📄 Creating schema...');
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('✅ Schema created');

        // Run seed
        console.log('🌱 Seeding data...');
        const seedPath = path.join(__dirname, 'db', 'seed.sql');
        const seed = fs.readFileSync(seedPath, 'utf8');
        await pool.query(seed);
        console.log('✅ Data seeded');

        console.log('\n🎉 Database reset complete!\n');
    } catch (error: any) {
        console.error('❌ Reset error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

resetDB();
