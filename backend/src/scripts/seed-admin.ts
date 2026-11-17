import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function seedSuperAdmin() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        const email = 'admin@mediganga.com';
        const password = 'adminpassword123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const phone = '9999999999';

        // Check if admin exists
        const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            console.log('⚠️ Admin user already exists. Updating role to super_admin...');
            await client.query('UPDATE users SET role = $1 WHERE email = $2', ['super_admin', email]);
        } else {
            console.log('🌱 Creating new Super Admin user...');
            await client.query(
                `INSERT INTO users (id, name, email, phone, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [uuidv4(), 'Super Admin', email, phone, hashedPassword, 'super_admin']
            );
        }

        console.log('✅ Super Admin seeded successfully.');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seedSuperAdmin();
