import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';

async function verifyUniquePaths() {
    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        // Check if images start with /medicines/ and are unique
        const res = await client.query("SELECT name, image_url FROM medicines WHERE name IN ('Dolo 650', 'Combiflam', 'Zincovit')");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
verifyUniquePaths();
