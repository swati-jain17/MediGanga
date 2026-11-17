import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function fixRoles() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        // 1. Drop existing constraint
        console.log('🛠 Dropping old role constraint...');
        await client.query(`
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
        `);

        // 2. Add new constraint with all roles
        console.log('✨ Adding updated role constraint...');
        await client.query(`
            ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('customer', 'pharmacist', 'delivery_partner', 'admin', 'super_admin', 'order_manager', 'inventory_manager'));
        `);

        // 3. Ensure admin user has correct role
        console.log('👤 Updating admin user role...');
        await client.query(`
            UPDATE users SET role = 'super_admin' WHERE email = 'admin@mediganga.com';
        `);

        console.log('✅ Role constraint updated and admin user fixed.');

    } catch (err) {
        console.error('❌ Fix failed:', err);
    } finally {
        await client.end();
    }
}

fixRoles();
