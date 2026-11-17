import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function forceRecreateAdmin() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        const email = 'admin@mediganga.com';
        const password = 'adminpassword123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const phone = '9999999999';

        console.log(`🗑 Deleting existing admin user ${email} or phone ${phone}...`);
        await client.query('DELETE FROM users WHERE email = $1 OR phone = $2', [email, phone]);

        console.log('🌱 Creating new fresh Admin user...');
        await client.query(
            `INSERT INTO users (id, name, email, phone, password_hash, role, profile_picture) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [uuidv4(), 'Super Admin', email, '9999999999', hashedPassword, 'super_admin', 'https://ui-avatars.com/api/?name=Admin']
        );

        console.log('✅ Admin user recreated successfully.');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

        // Verify it exists
        const res = await client.query('SELECT email, role, password_hash FROM users WHERE email = $1', [email]);
        console.log('🔍 Verification:', res.rows[0]);

    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await client.end();
    }
}

forceRecreateAdmin();
