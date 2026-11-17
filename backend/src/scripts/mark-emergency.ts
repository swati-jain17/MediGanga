
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from correct path (assuming script is in src/scripts)
dotenv.config({ path: join(__dirname, '../../.env') });

async function markEmergencyMedicines() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/mediganga';
    const client = new pg.Client({ connectionString: dbUrl });

    try {
        await client.connect();
        console.log('📦 Connected to database');

        const keywords = [
            'Insulin',
            'Inhaler',
            'Digoxin',
            'Adrenaline',
            'Sorbitrate',
            'Nitroglycerin',
            'Atorvastatin',
            'Clopidogrel',
            'Aspirin',
            'Metoprolol'
        ];

        console.log(`🔍 Marking medicines with keywords: ${keywords.join(', ')}`);

        // Check if column exists just in case (though it should)
        // Actually, we skip that check and assume schema is synced.

        let totalUpdated = 0;

        for (const keyword of keywords) {
            const result = await client.query(
                `UPDATE medicines 
                 SET is_emergency_available = TRUE 
                 WHERE name ILIKE $1 OR generic_name ILIKE $1
                 RETURNING id, name`,
                [`%${keyword}%`]
            );

            if ((result.rowCount || 0) > 0) {
                console.log(`✅ Marked ${result.rowCount} items for "${keyword}"`);
                totalUpdated += (result.rowCount || 0);
            }
        }

        console.log(`\n🎉 Total emergency medicines marked: ${totalUpdated}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.end();
    }
}

markEmergencyMedicines();
