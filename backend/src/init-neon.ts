import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initNeon() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    const client = new pg.Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('✅ Connected to Neon Database');

        console.log('📄 Applying Schema...');
        const schemaPath = join(__dirname, 'db', 'schema.sql');
        const schemaSql = readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('✅ Schema applied successfully');

        console.log('🌱 Adding Seed Data...');
        const seedPath = join(__dirname, 'db', 'seed.sql');
        const seedSql = readFileSync(seedPath, 'utf8');
        await client.query(seedSql);
        console.log('✅ Seed data inserted successfully');

        console.log('\n🎉 Cloud Database Initialization Complete!\n');
    } catch (error: any) {
        console.error('❌ Error during initialization:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

initNeon();
