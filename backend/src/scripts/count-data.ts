import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function countData() {
    const client = new Client({ connectionString: dbUrl });

    try {
        await client.connect();

        const orders = await client.query('SELECT COUNT(*) FROM orders');
        const prescriptions = await client.query('SELECT COUNT(*) FROM prescriptions');
        const users = await client.query('SELECT COUNT(*) FROM users');
        const medicines = await client.query('SELECT COUNT(*) FROM medicines');

        console.log('📊 Database Counts:');
        console.log(`📦 Orders: ${orders.rows[0].count}`);
        console.log(`📜 Prescriptions: ${prescriptions.rows[0].count}`);
        console.log(`👥 Users: ${users.rows[0].count}`);
        console.log(`💊 Medicines: ${medicines.rows[0].count}`);

    } catch (err) {
        console.error('❌ Count failed:', err);
    } finally {
        await client.end();
    }
}

countData();
