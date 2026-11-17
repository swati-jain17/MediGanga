import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function resetAdminPassword() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        const email = 'admin@mediganga.com';
        const newPassword = 'adminpassword123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log(`🔐 Resetting password for ${email}...`);

        await client.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE email = $2
        `, [hashedPassword, email]);

        console.log('✅ Password reset successfully.');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 New Password: ${newPassword}`);

    } catch (err) {
        console.error('❌ Reset failed:', err);
    } finally {
        await client.end();
    }
}

resetAdminPassword();
