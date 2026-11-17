import { pool } from '../config/database.js';

async function addProfilePictureColumn() {
    try {
        console.log('Adding profile_picture column to users table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture TEXT;
        `);
        console.log('✅ Successfully added profile_picture column.');
    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        await pool.end();
    }
}

addProfilePictureColumn();
