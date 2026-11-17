import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function addProfilePicture() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        // Check if column exists
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='profile_picture';
        `);

        if (res.rows.length === 0) {
            console.log('✨ Adding profile_picture column...');
            await client.query(`
                ALTER TABLE users 
                ADD COLUMN profile_picture VARCHAR(500);
            `);
            console.log('✅ Column added successfully.');
        } else {
            console.log('ℹ️ Column profile_picture already exists.');
        }

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

addProfilePicture();
