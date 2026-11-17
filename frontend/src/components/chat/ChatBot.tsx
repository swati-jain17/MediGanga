import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Search, FileText, Package, Phone, Sparkles } from 'lucide-react';
import { chatService, type ChatMessage } from '../../services/chat.service';
import { getImageUrl } from '../../services/api';
import { Link } from 'react-router-dom';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    type?: 'text' | 'medicines' | 'order' | 'action';
    data?: any;
    action?: string;
}

const QUICK_ACTIONS = [
    { label: "Search Medicines", icon: Search, action: "SEARCH_MEDICINES" },
    { label: "Upload Prescription", icon: FileText, action: "UPLOAD_PRESCRIPTION" },
    { label: "Track My Order", icon: Package, action: "TRACK_ORDER" },
    { label: "Support", icon: Phone, action: "SUPPORT" }
];

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hi 👋 I’m your MediGanga Assistant. I can help you search medicines, upload prescriptions, and track orders in any Indian language. What would you like to do?",
            sender: 'bot'
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Prepare history for API
            const history: ChatMessage[] = messages
                .filter(m => m.sender !== 'bot' || m.id !== 1) // Exclude welcome message if needed, or map properly
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'model',
                    parts: m.text
                }));

            // Add current user message to history logic properly or backend might handle it
            // Backend endpoint expects full history? Or stateless? 
            // My implementation was stateless history passed in. 
            // So I should pass `[...history, { role: 'user', parts: text }]` basically.

            const apiHistory = history; // The user message is already in `messages` state but let's be careful about timing
            // Do not append current message to history, as backend handles it as the 'message' argument
            const currentHistory = apiHistory;

            const response = await chatService.sendMessage(text, currentHistory);

            const botMsg: Message = {
                id: Date.now() + 1,
                text: response.message || "Here is what I found:", // Fallback text
                sender: 'bot',
                type: response.type,
                data: response.data,
                action: response.action
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("ChatBot Error:", error);
            let errorMessage = "Sorry, I'm having trouble connecting. Please try again.";
            // @ts-ignore
            if (error.response?.status === 404) errorMessage = "Chat service not found (404). Backend might need restart.";
            // @ts-ignore
            if (error.response?.status === 500) errorMessage = "Server error. Please check backend logs.";

            setMessages(prev => [...prev, { id: Date.now(), text: errorMessage, sender: 'bot' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case "SEARCH_MEDICINES":
                handleSend("I want to search for medicines");
                break;
            case "UPLOAD_PRESCRIPTION":
                handleSend("I want to upload a prescription");
                break;
            case "TRACK_ORDER":
                handleSend("Track my order");
                break;
            case "SUPPORT":
                handleSend("Help me contact support");
                break;
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl"
            >
                <Sparkles size={24} fill="currentColor" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">MediGanga AI</h3>
                                    <p className="text-xs text-emerald-100">Supports all Indian languages</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                                        {/* Render Medicines */}
                                        {msg.type === 'medicines' && msg.data && (
                                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                                                {msg.data.slice(0, 5).map((med: any) => (
                                                    <Link to={`/medicines/${med.id}`} key={med.id} className="min-w-[140px] bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-emerald-500 transition block">
                                                        <div className="h-20 bg-white rounded-md mb-2 flex items-center justify-center overflow-hidden">
                                                            <img src={getImageUrl(med.image_url) || '/medicines/placeholder.png'} alt={med.name} className="h-full object-contain" />
                                                        </div>
                                                        <p className="text-xs font-bold truncate text-gray-900">{med.name}</p>
                                                        <p className="text-xs text-emerald-600 font-bold">₹{med.price || med.mrp}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Render Order Status */}
                                        {msg.type === 'order' && msg.data && (
                                            <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-semibold text-blue-800">Order #{msg.data.id}</span>
                                                    <span className="text-xs font-bold text-blue-600">₹{msg.data.total_amount}</span>
                                                </div>
                                                <div className="text-sm font-bold text-blue-900">{msg.data.status}</div>
                                            </div>
                                        )}

                                        {/* Render Action Buttons */}
                                        {msg.type === 'action' && (
                                            <div className="mt-3">
                                                {msg.action === 'upload_prescription' && (
                                                    <button
                                                        onClick={() => {
                                                            setIsOpen(false);
                                                            window.location.href = '/prescriptions';
                                                        }}
                                                        className="w-full bg-emerald-100 text-emerald-700 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition"
                                                    >
                                                        Upload Prescription Now
                                                    </button>
                                                )}
                                                {msg.action === 'contact_support' && (
                                                    <a
                                                        href="tel:1800-123-4567"
                                                        className="block w-full text-center bg-emerald-100 text-emerald-700 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition"
                                                    >
                                                        Call Support (1800-123-4567)
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-1">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions (only if few messages) */}
                        {messages.length < 3 && (
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide bg-gray-50/50">
                                {QUICK_ACTIONS.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => handleQuickAction(action.action)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 flex items-center gap-1.5 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition shadow-sm"
                                    >
                                        <action.icon size={12} />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-2 items-center"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything in any language..."
                                    className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
