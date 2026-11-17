#!/usr/bin/env node
/**
 * Database Setup Script
 * Creates the database if it doesn't exist and runs migrations
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';
    const dbName = new URL(dbUrl).pathname.slice(1) || 'mediganga';

    // Connect to postgres to create database
    const adminClient = new pg.Client({
        connectionString: dbUrl.replace(`/${dbName}`, '/postgres'),
    });

    try {
        await adminClient.connect();
        console.log('📦 Connected to PostgreSQL');

        // Check if database exists
        const result = await adminClient.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [dbName]
        );

        if (result.rows.length === 0) {
            console.log(`🔨 Creating database: ${dbName}`);
            await adminClient.query(`CREATE DATABASE ${dbName}`);
            console.log('✅ Database created');
        } else {
            console.log(`✅ Database ${dbName} already exists`);
        }
    } catch (error: any) {
        if (error.code === '42P04') {
            console.log(`✅ Database ${dbName} already exists`);
        } else {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    } finally {
        await adminClient.end();
    }

    // Now connect to the actual database and run schema
    const appClient = new pg.Client({ connectionString: dbUrl });

    try {
        await appClient.connect();
        console.log('📄 Running schema...');

        const schemaPath = join(__dirname, 'db', 'schema.sql');
        const schemaSql = readFileSync(schemaPath, 'utf8');
        await appClient.query(schemaSql);
        console.log('✅ Schema created');

        // Check if medicines table is empty
        const countResult = await appClient.query('SELECT COUNT(*) FROM medicines');
        const count = parseInt(countResult.rows[0].count, 10);

        if (count === 0) {
            console.log('🌱 Seeding database...');
            const seedPath = join(__dirname, 'db', 'seed.sql');
            const seedSql = readFileSync(seedPath, 'utf8');
            await appClient.query(seedSql);
            console.log('✅ Seed data inserted');
        } else {
            console.log(`✅ Database already has ${count} medicines`);
        }

        console.log('\n🎉 Database setup complete!\n');
    } catch (error: any) {
        console.error('❌ Setup error:', error.message);
        process.exit(1);
    } finally {
        await appClient.end();
    }
}

setupDatabase();
