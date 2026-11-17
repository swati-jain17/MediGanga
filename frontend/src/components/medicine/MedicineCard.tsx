import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Leaf, AlertTriangle, Zap } from 'lucide-react';
import type { Medicine } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { getImageUrl } from '../../services/api';

interface MedicineCardProps {
    medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
    const items = useCartStore(state => state.items);
    const addItem = useCartStore(state => state.addItem);
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const removeItem = useCartStore(state => state.removeItem);

    const cartItem = items.find(i => i.medicineId === medicine.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        await addItem({
            medicineId: medicine.id,
            name: medicine.name,
            quantity: 1,
            price: medicine.mrp,
            originalPrice: medicine.mrp,
            isGeneric: false,
            scheduleType: medicine.schedule_type,
            manufacturer: medicine.manufacturer,
            imageUrl: medicine.image_url,
            isEmergency: medicine.is_emergency_available,
        });
    };

    const handleUpdateQuantity = (newQty: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (newQty < 1) {
            removeItem(medicine.id);
        } else {
            updateQuantity(medicine.id, newQty);
        }
    };

    const getScheduleBadge = () => {
        switch (medicine.schedule_type) {
            case 'H':
            case 'H1':
                return (
                    <span className="badge-h px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Rx
                    </span>
                );
            case 'X':
                return (
                    <span className="badge-x px-2 py-0.5 rounded-full text-xs font-semibold">
                        Schedule X
                    </span>
                );
            default:
                return (
                    <span className="badge-otc px-2 py-0.5 rounded-full text-xs font-semibold">
                        OTC
                    </span>
                );
        }
    };

    const savingsPercent = medicine.generic_mrp
        ? Math.round(((medicine.mrp - medicine.generic_mrp) / medicine.mrp) * 100)
        : 0;

    return (
        <Link to={`/medicine/${medicine.id}`}>
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl overflow-hidden card-shadow card-shadow-hover transition-all group"
            >
                {/* Image area */}
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {getScheduleBadge()}
                        {medicine.is_ayurvedic && (
                            <span className="bg-ayurveda-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                                <Leaf size={10} />
                                Ayurveda
                            </span>
                        )}
                        {medicine.is_emergency_available && (
                            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                                <Zap size={10} className="fill-current" />
                                Priority
                            </span>
                        )}
                    </div>

                    {/* Savings badge */}
                    {savingsPercent > 10 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 bg-ayurveda-500 text-white px-2 py-1 rounded-lg text-xs font-bold"
                        >
                            Save {savingsPercent}%
                        </motion.div>
                    )}

                    {/* Placeholder image */}
                    {/* Image */}
                    <div className="w-full h-full flex items-center justify-center p-2">
                        {medicine.image_url ? (
                            <img
                                src={getImageUrl(medicine.image_url)}
                                alt={medicine.name}
                                className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-primary-500">
                                    {medicine.name.charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition">
                        {medicine.name}
                    </h3>

                    {medicine.manufacturer && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                            {medicine.manufacturer}
                        </p>
                    )}

                    {medicine.pack_size && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            {medicine.pack_size}
                        </p>
                    )}

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div>
                            <p className="text-lg font-bold text-gray-900">₹{medicine.mrp}</p>
                            {medicine.generic_mrp && (
                                <p className="text-xs text-ayurveda-600">
                                    Generic from ₹{medicine.generic_mrp}
                                </p>
                            )}
                        </div>

                        {quantity > 0 ? (
                            <div className="flex items-center bg-primary-50 rounded-xl overflow-hidden shadow-inner">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => handleUpdateQuantity(quantity - 1, e)}
                                    className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100"
                                >
                                    -
                                </motion.button>
                                <span className="w-6 text-center text-sm font-bold text-gray-900">{quantity}</span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => handleUpdateQuantity(quantity + 1, e)}
                                    className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100"
                                >
                                    +
                                </motion.button>
                            </div>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddToCart}
                                className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition shadow-lg shadow-primary-500/30"
                            >
                                <Plus size={20} />
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
