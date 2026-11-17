import { chatService } from '../services/chat.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debugDbSearch() {
    console.log("🔍 Debugging DB Search...");
    try {
        const query = "Dolo";
        console.log(`Searching for "${query}"...`);
        const results = await chatService.searchMedicines(query);
        console.log(`Found ${results.length} results.`);
        console.log(results);
    } catch (error) {
        console.error("❌ DB Search Error:", error);
    }
}

debugDbSearch();
