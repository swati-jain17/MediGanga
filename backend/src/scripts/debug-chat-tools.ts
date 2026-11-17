import { chatService } from '../services/chat.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function debugChatTools() {
    console.log("🐛 Debugging Chat Tools...");

    const prompts = [
        "Do you have Dolo?",
        "Search for paracetamol",
        "Track order #12345",
        "I want to upload a prescription"
    ];

    for (const prompt of prompts) {
        console.log(`\nUser: "${prompt}"`);
        try {
            // We use the service directly, but we want to see the RAW text before parsing if possible.
            // Since sendMessage returns processed result, we might need to modify service temporarily or just see what sendMessage returns.
            // If sendMessage returns { text: "..." } it means tool failed.
            const response = await chatService.sendMessage(prompt, []);
            console.log("Raw Response Object:", JSON.stringify(response, null, 2));

            if (response.tool) {
                console.log("✅ Tool Triggered:", response.tool);
            } else {
                console.log("❌ No Tool Triggered (Text Response only)");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

debugChatTools();
