import pool from './config/database.js';

async function addIsExpiredColumn() {
    try {
        console.log('Adding is_expired column to prescriptions table...');

        // Add column as regular boolean with default FALSE
        await pool.query(`
      ALTER TABLE prescriptions 
      ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT FALSE;
    `);

        // Update existing rows to calculate is_expired
        await pool.query(`
      UPDATE prescriptions 
      SET is_expired = (expiry_date < CURRENT_DATE)
      WHERE expiry_date IS NOT NULL;
    `);

        console.log('✅ Successfully added is_expired column and updated existing rows');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addIsExpiredColumn();
