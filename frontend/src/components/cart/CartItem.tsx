import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';
import { useCartStore } from '../../store/cartStore';

interface Props {
    item: CartItemType;
}

export function CartItem({ item }: Props) {
    const { updateQuantity, removeItem, switchToGeneric } = useCartStore();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-4 card-shadow"
        >
            <div className="flex gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary-500">
                        {item.name.charAt(0)}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                            {item.manufacturer && (
                                <p className="text-sm text-gray-500 truncate">{item.manufacturer}</p>
                            )}

                            {/* Schedule badge */}
                            {item.scheduleType !== 'OTC' && (
                                <span className="inline-block mt-1 badge-h px-2 py-0.5 rounded text-xs">
                                    Rx Required
                                </span>
                            )}
                        </div>

                        {/* Remove button */}
                        <button
                            onClick={() => removeItem(item.medicineId)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    {/* Generic switch */}
                    {item.genericAlternative && !item.isGeneric && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => switchToGeneric(item.medicineId)}
                            className="mt-2 flex items-center gap-2 text-sm text-ayurveda-600 hover:text-ayurveda-700 bg-ayurveda-50 hover:bg-ayurveda-100 px-3 py-1.5 rounded-lg transition"
                        >
                            <ArrowRightLeft size={14} />
                            Switch to Generic — Save ₹{item.genericAlternative.savings}
                        </motion.button>
                    )}

                    {item.isGeneric && (
                        <span className="inline-block mt-2 text-xs text-ayurveda-600 bg-ayurveda-50 px-2 py-1 rounded-lg">
                            ✓ Generic — Saving ₹{item.originalPrice - item.price}/unit
                        </span>
                    )}

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between mt-3">
                        <div>
                            <span className="text-lg font-bold text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                            {item.quantity > 1 && (
                                <span className="text-sm text-gray-500 ml-2">
                                    (₹{item.price} × {item.quantity})
                                </span>
                            )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                                disabled={item.quantity >= 10}
                                className="w-8 h-8 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white flex items-center justify-center transition"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
