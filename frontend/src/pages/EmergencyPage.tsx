import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Zap, MapPin, Clock, AlertTriangle, Search, ShoppingCart, ChevronRight, Package } from 'lucide-react';
import { emergencyApi } from '../services/api';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function EmergencyPage() {
    const { addItem } = useCartStore();
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (_error) => {
                    // Default to Varanasi for demo
                    setLocation({ latitude: 25.3176, longitude: 82.9913 });
                }
            );
        }
    }, []);

    // Check emergency availability
    const { data: availabilityData, isLoading: checkingAvailability } = useQuery({
        queryKey: ['emergency-availability', location],
        queryFn: async () => {
            if (!location) return null;
            const res = await emergencyApi.checkAvailability(location.latitude, location.longitude);
            return res.data.data;
        },
        enabled: !!location,
    });

    // Get emergency categories
    const { data: categoriesData } = useQuery({
        queryKey: ['emergency-categories'],
        queryFn: async () => {
            const res = await emergencyApi.getCategories();
            return res.data.data;
        },
    });

    // Get emergency medicines
    const { data: medicinesData, isLoading: loadingMeds } = useQuery({
        queryKey: ['emergency-medicines', availabilityData?.store?.id, selectedCategory, searchQuery],
        queryFn: async () => {
            if (!availabilityData?.store?.id) return [];
            const res = await emergencyApi.getMedicines({
                storeId: availabilityData.store.id,
                category: selectedCategory || undefined,
                query: searchQuery || undefined,
            });
            return res.data.data;
        },
        enabled: !!availabilityData?.available,
    });

    const handleAddToCart = (medicine: any) => {
        addItem({
            medicineId: medicine.id,
            name: medicine.name,
            price: medicine.mrp,
            quantity: 1,
            originalPrice: medicine.mrp,
            isGeneric: false,
            scheduleType: medicine.schedule_type,
            manufacturer: medicine.manufacturer,
            imageUrl: medicine.image_url,
        });
    };

    if (!location || checkingAvailability) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-pulse mb-4">
                        <Zap size={64} className="mx-auto text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Checking Availability...</h2>
                    <p className="text-gray-600">Finding nearest emergency pharmacy</p>
                </div>
            </div>
        );
    }

    if (!availabilityData?.available) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={48} className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Emergency Delivery Unavailable</h2>
                    <p className="text-gray-600 mb-6">
                        {availabilityData?.message || 'Emergency delivery is not available in your area yet.'}
                    </p>
                    <Link
                        to="/search"
                        className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-bold"
                    >
                        Browse All Medicines <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 pb-24">
            {/* Emergency Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-6 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 mb-4"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">MediGanga Rapid</h1>
                            <p className="text-red-100">Emergency delivery in 30-45 minutes</p>
                        </div>
                    </motion.div>

                    {/* Delivery Info */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <MapPin size={20} className="mx-auto mb-1" />
                            <p className="text-sm">{availabilityData.store.city}</p>
                            <p className="text-xs text-red-200">{availabilityData.store.distance} km away</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <Clock size={20} className="mx-auto mb-1" />
                            <p className="text-sm">{availabilityData.estimatedMinutes} min</p>
                            <p className="text-xs text-red-200">Estimated</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <Package size={20} className="mx-auto mb-1" />
                            <p className="text-sm">₹{availabilityData.surgeFee}</p>
                            <p className="text-xs text-red-200">Surge fee</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="max-w-4xl mx-auto px-4 -mt-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search emergency medicines..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg border-0 focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-4xl mx-auto px-4 mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Quick Categories</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${selectedCategory === null
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        All
                    </button>
                    {categoriesData?.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition flex items-center gap-2 ${selectedCategory === cat.id
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Medicines Grid */}
            <div className="max-w-4xl mx-auto px-4 mt-6">
                {loadingMeds ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : medicinesData?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No medicines found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {medicinesData?.map((med: any) => (
                            <motion.div
                                key={med.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                        In Stock: {med.available_stock}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{med.name}</h4>
                                <p className="text-gray-500 text-xs mb-3">{med.pack_size}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">₹{med.mrp}</span>
                                    <button
                                        onClick={() => handleAddToCart(med)}
                                        className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition"
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Emergency Notice */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="font-bold text-amber-800">Emergency Delivery Notice</h4>
                            <p className="text-amber-700 text-sm">
                                Emergency orders are prioritized for delivery within 30-45 minutes.
                                A surge fee of ₹{availabilityData.surgeFee} applies. For life-threatening
                                emergencies, please call 108 or visit the nearest hospital.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
