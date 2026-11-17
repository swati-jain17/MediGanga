import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function migrateRoles() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        console.log('🔄 Updating role check constraint...');

        // Drop the old constraint
        await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);

        // Add the new constraint with expanded roles
        await client.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('customer', 'pharmacist', 'delivery_partner', 'admin', 'super_admin', 'order_manager', 'inventory_manager', 'prescription_verifier'));
    `);

        console.log('✅ Role constraint updated successfully.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrateRoles();
