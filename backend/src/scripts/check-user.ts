import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function checkUser() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        const phone = '9999999999';
        const res = await client.query('SELECT id, name, email, role FROM users WHERE phone = $1', [phone]);
        console.log('User found:', res.rows[0]);

        if (res.rows.length > 0) {
            // Upgrade this user to super_admin
            await client.query('UPDATE users SET role = $1 WHERE phone = $2', ['super_admin', phone]);
            console.log('✅ Updated existing user to super_admin');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkUser();
