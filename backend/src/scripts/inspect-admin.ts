import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function inspectAdmin() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        const email = 'admin@mediganga.com';
        const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            console.log('🧐 Admin User Found:', res.rows[0]);
        } else {
            console.log('❌ Admin user NOT found.');
        }

    } catch (err) {
        console.error('❌ Inspection failed:', err);
    } finally {
        await client.end();
    }
}

inspectAdmin();
