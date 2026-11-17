import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

export function SubstituteModal() {
    const {
        substituteModalOpen,
        currentSubstitute,
        closeSubstituteModal,
        confirmSubstitute
    } = useCartStore();

    if (!substituteModalOpen || !currentSubstitute) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                        <button
                            onClick={closeSubstituteModal}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-yellow-300" size={24} />
                            <span className="font-bold text-yellow-300 uppercase tracking-wider text-sm shadow-black/10 shadow-sm">Smart Savings</span>
                        </div>
                        <h2 className="text-2xl font-bold">Save ₹{currentSubstitute.savings} on this item!</h2>
                        <p className="text-blue-100 mt-1">
                            Same salt composition, same effectiveness.
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="flex items-center justify-between gap-4 mb-8">
                            {/* Original */}
                            <div className="flex-1 p-4 rounded-xl border-2 border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50 text-center opacity-70 scale-95">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expensive Brand</p>
                                <p className="font-bold text-gray-900 dark:text-white line-through text-lg">₹{currentSubstitute.originalPrice}</p>
                            </div>

                            <ArrowRight className="text-gray-400" />

                            {/* Substitute */}
                            <div className="flex-1 p-4 rounded-xl border-2 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 text-center transform scale-105 shadow-lg">
                                <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">MediGanga Choice</p>
                                <p className="font-bold text-green-700 dark:text-green-400 text-2xl">₹{currentSubstitute.price}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={confirmSubstitute}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
                            >
                                Switch & Save ₹{currentSubstitute.savings}
                            </button>

                            <button
                                onClick={closeSubstituteModal}
                                className="w-full py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium transition-colors"
                            >
                                No thanks, I'll pay more
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-6">
                            Both medicines contain <strong>{currentSubstitute.saltComposition || 'the same active ingredients'}</strong>.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
