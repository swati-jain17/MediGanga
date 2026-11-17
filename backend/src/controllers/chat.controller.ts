import { Request, Response } from 'express';
import { chatService } from '../services/chat.service.js';

export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("💬 Chat Request Received:", req.body.message);
        const { message, history } = req.body;

        // 1. Get AI response (Text or Tool Call)
        const aiResponse = await chatService.sendMessage(message, history || []);

        // 2. If it's just text, return it
        if (!aiResponse.tool) {
            res.json({ message: aiResponse.text });
            return;
        }

        // 3. Handle Tools
        const tool = aiResponse.tool;

        if (tool === 'search_medicine') {
            const medicines = await chatService.searchMedicines(aiResponse.query);
            if (medicines && medicines.length > 0) {
                res.json({
                    message: `Found ${medicines.length} medicines matching "${aiResponse.query}":`,
                    type: 'medicines',
                    data: medicines
                });
            } else {
                // Fallback if no results
                res.json({ message: `I couldn't find any medicines matching "${aiResponse.query}". Try searching for a generic name like "Paracetamol".` });
            }
            return;
        }

        if (tool === 'track_order') {
            const order = await chatService.trackOrder(aiResponse.value);
            if (order) {
                res.json({
                    message: `Order #${aiResponse.value} is currently: **${order.status}**.`,
                    type: 'order',
                    data: order
                });
            } else {
                res.json({ message: `I couldn't find an order with ID "${aiResponse.value}". Please check the ID and try again.` });
            }
            return;
        }

        if (tool === 'upload_prescription') {
            res.json({
                message: "Sure, let's upload your prescription. Please ensure it's a clear photo.",
                type: 'action',
                action: 'upload_prescription'
            });
            return;
        }

        if (tool === 'contact_support') {
            res.json({
                message: "Connecting you to support...",
                type: 'action',
                action: 'contact_support'
            });
            return;
        }

        // Fallback
        res.json({ message: "I'm not sure how to handle that request yet." });

    } catch (error) {
        console.error("❌ Chat Controller Error:", error);
        res.status(500).json({ message: "Sorry, I'm having trouble connecting right now." });
    }
};
