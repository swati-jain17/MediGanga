import { Client } from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';
const secret = process.env.JWT_SECRET || 'dev-secret-key';

async function getToken() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        const res = await client.query("SELECT id, email, role FROM users WHERE email = 'admin@mediganga.com'");
        if (res.rows.length > 0) {
            const user = res.rows[0];
            const token = jwt.sign({ userId: user.id, phone: '' }, secret, { expiresIn: '1h' });
            console.log('🔑 Token:', token);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

getToken();
