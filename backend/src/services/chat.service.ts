import { GoogleGenerativeAI } from "@google/generative-ai";
import { pool } from "../config/database.js";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY || '');

const SYSTEM_INSTRUCTION = `
You are MediGanga Assistant, an AI chatbot inside the Mediganga medicine delivery webapp.
Your job is to help users explore the app, use all features, and complete tasks.

1) Personality: Friendly, polite, empathethic, Indian-friendly English.
2) Language: Detect user language and reply in same. Support ALL Indian languages including Hindi, Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Odia, Assamese, Urdu. If user mixes languages (Hinglish, etc), do the same.
3) Safety: You are NOT a doctor. Do NOT diagnose. Suggest doctor visit for serious issues.
4) Tools: You have tools to search medicines and track orders. USE THEM when user asks.
   - For "search medicine", output a JSON block: { "tool": "search_medicine", "query": "..." }
   - For "track order", output a JSON block: { "tool": "track_order", "value": "..." }
   - For "upload prescription", output a JSON block: { "tool": "upload_prescription" }
   - For "support", output a JSON block: { "tool": "contact_support" }

If the user greets, just verify you are ready to help. 
If the user asks a question you can answer directly (FAQs), do so.
If you need to perform an action, output the JSON block ONLY. 
Do not output markdown code blocks for these JSON tool calls, just the raw JSON.
`;

const model = genAI.getGenerativeModel({
    model: "gemini-flash-lite-latest",
    systemInstruction: SYSTEM_INSTRUCTION
});

export const chatService = {
    async sendMessage(message: string, history: any[] = []) {
        try {
            // Construct prompt with history
            let chatHistory = history.map(h => `${h.role === 'user' ? 'User' : 'Model'}: ${h.parts}`).join('\n');
            const prompt = `${SYSTEM_INSTRUCTION}\n\nChat History:\n${chatHistory}\n\nUser: ${message}\nModel:`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Check if response tries to call a tool
            try {
                // Attempt to find JSON block in the text
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const cleanJson = jsonMatch[0];
                    const toolCall = JSON.parse(cleanJson);
                    if (toolCall.tool) {
                        return { ...toolCall, text: null }; // Return tool instruction
                    }
                }
            } catch (e) {
                console.log("JSON Parse fail:", e);
                // Not a valid JSON or tool call, just return text
            }

            return { text: text, tool: null };

        } catch (error) {
            console.error("Gemini Chat Error:", error);
            throw new Error("Failed to process chat message");
        }
    },

    async searchMedicines(query: string) {
        try {
            const result = await pool.query(
                "SELECT id, name, category, mrp, image_url FROM medicines WHERE name ILIKE $1 OR category ILIKE $1 LIMIT 5",
                [`%${query}%`]
            );
            return result.rows;
        } catch (error) {
            console.error("DB Search Error:", error);
            throw error;
        }
    },

    async trackOrder(orderIdOrPhone: string) {
        try {
            // Simple check: is it numeric? assumes ID if short, phone if long
            let query = "SELECT id, status, total_amount, created_at FROM orders WHERE id::text = $1";
            if (orderIdOrPhone.length > 5) { // Assume phone
                // Ideally we join with users, but for now lets strict to ID or exact match if supported
                // For now, let's just support Order ID for simplicity or exact phone match in user table
                // Let's settle on Order ID for MVP tool
            }

            const result = await pool.query(query, [orderIdOrPhone]);
            return result.rows[0];
        } catch (error) {
            console.error("DB Track Error:", error);
            return null;
        }
    }
};
