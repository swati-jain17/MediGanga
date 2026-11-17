import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

async function check() {
    console.log('Checking database...');
    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        const res = await client.query("SELECT name, image_url FROM medicines WHERE name = 'Dolo 650'");
        console.log('Result:', res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

check();
