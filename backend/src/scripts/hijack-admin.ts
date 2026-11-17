import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function hijackAdmin() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        const phone = '9999999999';
        const targetEmail = 'admin@mediganga.com';
        const targetPassword = 'adminpassword123';
        const hashedPassword = await bcrypt.hash(targetPassword, 10);

        // Find who has the phone
        const res = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);

        if (res.rows.length > 0) {
            const user = res.rows[0];
            console.log(`🕵️ Found user with phone ${phone}:`, { id: user.id, email: user.email, name: user.name });

            // Update this user to become the admin
            console.log('😈 Hijacking account to become Admin...');
            await client.query(`
                UPDATE users 
                SET email = $1, 
                    password_hash = $2, 
                    role = 'super_admin',
                    profile_picture = 'https://ui-avatars.com/api/?name=Admin',
                    name = 'Super Admin'
                WHERE id = $3
            `, [targetEmail, hashedPassword, user.id]);

            console.log('✅ Admin account restored via update.');

        } else {
            console.log('❓ No user found with that phone either. Weird.');
            // Then we should be able to insert?
            // Maybe there are other constraints?
        }

    } catch (err) {
        console.error('❌ Hijack failed:', err);
    } finally {
        await client.end();
    }
}

hijackAdmin();
