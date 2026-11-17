import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("🔑 API Key found:", process.env.GEMINI_API_KEY ? "YES" : "NO");
if (process.env.GEMINI_API_KEY) {
    console.log("🔑 API Key start:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
}

async function testGemini() {
    const modelsToTry = [
        "gemini-2.0-flash-lite-001",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash-lite"
    ];

    for (const modelName of modelsToTry) {
        console.log(`\n👉 Testing model: ${modelName}`);
        try {
            const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY || '';
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${modelName} SUCCESS:`, result.response.text());
            return; // Exit on first success
        } catch (error: any) {
            console.error(`❌ ${modelName} FAILED:`, error.message);
        }
    }
}

testGemini();
