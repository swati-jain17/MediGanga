import axios from 'axios';
import { Client } from 'pg';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-local-testing';

async function verifyAdminApi() {
    const client = new Client({ connectionString: dbUrl });

    try {
        // 1. Get the admin user
        await client.connect();
        const res = await client.query("SELECT * FROM users WHERE role = 'super_admin' LIMIT 1");

        if (res.rows.length === 0) {
            console.log('❌ No super_admin found in DB.');
            return;
        }

        const adminUser = res.rows[0];
        console.log(`👤 Found Admin: ${adminUser.email} (${adminUser.role})`);

        // 2. Generate Token (simulating login)
        const token = jwt.sign(
            { userId: adminUser.id, role: adminUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('🔑 Generated Test Token');

        // 3. Call Dashboard API
        console.log('🚀 Calling /api/admin/dashboard...');
        const response = await axios.get('http://localhost:3000/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ API Success!');
        console.log('📊 Dashboard Stats:', JSON.stringify(response.data.data, null, 2));

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    } finally {
        await client.end();
    }
}

verifyAdminApi();
