import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '../services/api';
import { Pill, Package, Building2, AlertTriangle, Leaf, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '../services/api';
import { useCartStore } from '../store/cartStore';

const scheduleLabels: Record<string, { label: string; color: string; bg: string }> = {
    OTC: { label: 'No Rx Required', color: 'text-ayurveda-700', bg: 'bg-ayurveda-100' },
    H: { label: 'Prescription Required', color: 'text-saffron-700', bg: 'bg-saffron-100' },
    H1: { label: 'Prescription Required', color: 'text-orange-700', bg: 'bg-orange-100' },
    X: { label: 'Controlled Substance', color: 'text-red-700', bg: 'bg-red-100' },
};

export function MedicineDetailPage() {
    const { id } = useParams<{ id: string }>();
    const addItem = useCartStore(state => state.addItem);

    const { data: medicine, isLoading, error } = useQuery({
        queryKey: ['medicine', id],
        queryFn: async () => {
            const response = await medicinesApi.getById(id!);
            return response.data.data;
        },
        enabled: !!id,
    });

    const { data: generic } = useQuery({
        queryKey: ['generic', id],
        queryFn: async () => {
            const response = await medicinesApi.getGenericAlternative(id!);
            return response.data.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-gray-200 rounded-2xl" />
                    <div className="h-8 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    if (error || !medicine) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                <AlertTriangle className="text-gray-300 mx-auto mb-4" size={64} />
                <p className="text-gray-500">Medicine not found</p>
            </div>
        );
    }

    const schedule = scheduleLabels[medicine.schedule_type] || scheduleLabels.OTC;

    const handleAddToCart = () => {
        addItem({
            medicineId: medicine.id,
            name: medicine.name,
            quantity: 1,
            price: medicine.mrp,
            originalPrice: medicine.mrp,
            isGeneric: false,
            scheduleType: medicine.schedule_type,
            manufacturer: medicine.manufacturer,
            imageUrl: medicine.image_url,
        });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="bg-gray-50 rounded-2xl h-[300px] md:h-[400px] w-full flex items-center justify-center p-4">
                    {medicine.image_url ? (
                        <img src={getImageUrl(medicine.image_url)} alt={medicine.name} className="max-h-full object-contain" />
                    ) : (
                        <Pill className="text-gray-300" size={120} />
                    )}
                </div>

                {/* Details */}
                <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${schedule.bg} ${schedule.color}`}>
                            {schedule.label}
                        </span>
                        {medicine.is_ayurvedic && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-ayurveda-100 text-ayurveda-700 flex items-center gap-1">
                                <Leaf size={14} />
                                Ayurveda
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{medicine.name}</h1>

                    {medicine.generic_name && (
                        <p className="text-primary-600 font-medium mb-2">{medicine.generic_name}</p>
                    )}

                    {medicine.salt_composition && (
                        <p className="text-gray-500 text-sm mb-4">{medicine.salt_composition}</p>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                        {medicine.manufacturer && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Building2 size={16} />
                                <span className="text-sm">{medicine.manufacturer}</span>
                            </div>
                        )}
                        {medicine.pack_size && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Package size={16} />
                                <span className="text-sm">{medicine.pack_size}</span>
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold text-gray-900">₹{medicine.mrp}</p>
                                <p className="text-sm text-gray-500">MRP (inclusive of all taxes)</p>
                            </div>
                            {generic && (
                                <div className="text-right">
                                    <p className="text-sm text-ayurveda-600 font-medium">Generic available</p>
                                    <p className="text-lg font-bold text-ayurveda-600">₹{generic.price}</p>
                                    <p className="text-xs text-ayurveda-500">Save ₹{generic.savings}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add to Cart */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        className="w-full btn btn-primary py-4 flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={20} />
                        Add to Cart
                    </motion.button>
                </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
                {medicine.category && (
                    <div className="bg-white rounded-xl p-4 card-shadow">
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium text-gray-900">{medicine.category}</p>
                    </div>
                )}
                {medicine.dosage_form && (
                    <div className="bg-white rounded-xl p-4 card-shadow">
                        <p className="text-sm text-gray-500">Dosage Form</p>
                        <p className="font-medium text-gray-900">{medicine.dosage_form}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
