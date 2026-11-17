import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '/Users/shauryasingh/Desktop/boltmed/backend/.env' });

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function checkMedicines() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        // Check columns
        const columnsRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'medicines';
        `);
        console.log('Columns:', columnsRes.rows.map(r => r.column_name));

        // Check sample data
        const sampleRes = await client.query(`
            SELECT id, name, image_url, image 
            FROM medicines 
            LIMIT 5;
        `);
        console.log('Sample Data:', sampleRes.rows);

        // Count with image_url
        const countRes = await client.query(`
            SELECT COUNT(*) 
            FROM medicines 
            WHERE image_url IS NOT NULL AND image_url != '';
        `);
        console.log('Count with valid image_url:', countRes.rows[0].count);


    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await client.end();
    }
}

checkMedicines();
