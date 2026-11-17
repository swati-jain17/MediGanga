import api from './api';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
}

export interface ChatResponse {
    message?: string;
    type?: 'text' | 'medicines' | 'order' | 'action';
    data?: any;
    action?: string;
}

export const chatService = {
    sendMessage: async (message: string, history: ChatMessage[] = []): Promise<ChatResponse> => {
        try {
            const response = await api.post('/chat', { message, history });
            return response.data;
        } catch (error) {
            console.error('Chat API Error:', error);
            throw error;
        }
    }
};
