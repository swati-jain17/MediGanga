import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Clock, Shield, ChevronRight, MapPin } from 'lucide-react';
import { MedicineRow } from '../components/medicine/MedicineRow';
import { ReviewsSection } from '../components/ReviewsSection';
import { useCartStore } from '../store/cartStore';
import heroScooter from '../assets/images/scooter-delivery-v2.png';

const CATEGORIES = [
    { id: 'pain-relief', name: 'Pain Relief', icon: '💊', color: 'bg-coral-100 text-coral-600' },
    { id: 'diabetes', name: 'Diabetes', icon: '🩸', color: 'bg-blue-100 text-blue-600' },
    { id: 'cardiac', name: 'Cardiac', icon: '❤️', color: 'bg-red-100 text-red-600' },
    { id: 'antibiotics', name: 'Antibiotics', icon: '🦠', color: 'bg-teal-100 text-teal-600' },
    { id: 'vitamins', name: 'Vitamins', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
    { id: 'gastric', name: 'Gastric', icon: '🫃', color: 'bg-green-100 text-green-600' },
    { id: 'skin-care', name: 'Skin Care', icon: '✨', color: 'bg-pink-100 text-pink-600' },
    { id: 'baby-care', name: 'Baby Care', icon: '👶', color: 'bg-indigo-100 text-indigo-600' },
];

const TARGET_CITIES = [
    { name: 'Varanasi', tagline: 'Kashi - City of Light' },
];

export function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-teal-500 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDBzMTAgMTAgMjAgMCAxMC0xMCAyMC0xMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMi41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />

                <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                                <span className="w-2 h-2 bg-saffron-400 rounded-full animate-pulse" />
                                <span className="text-sm font-medium">Now Live in Varanasi</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                India's Fastest<br />
                                <span className="text-saffron-300">Emergency Medicine Delivery</span>
                            </h1>

                            <p className="mt-6 text-lg text-primary-100 max-w-lg">
                                Your trusted neighborhood pharmacy, now faster. Genuine medicines, hospital-grade safety, and lightning-fast delivery across Varanasi.
                            </p>

                            <div className="flex flex-wrap gap-4 mt-8">
                                <Link
                                    to="/search?q="
                                    className="btn bg-white text-primary-600 hover:bg-saffron-400 hover:text-white py-4 px-8"
                                >
                                    Order Medicines
                                </Link>
                                <Link
                                    to="/prescriptions"
                                    className="btn bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 py-4 px-8"
                                >
                                    Upload Prescription
                                </Link>
                            </div>

                            {/* New Reward and Reminder Buttons */}
                            <div className="flex flex-wrap gap-4 mt-6">
                                <Link to="/rewards" className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                                    <span>🎁</span>
                                    <span>Rewards</span>
                                </Link>
                                <Link to="/reminders" className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
                                    <span>🔔</span>
                                    <span>Reminders</span>
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-6 mt-10">
                                <div className="flex items-center gap-2">
                                    <Truck size={20} className="text-saffron-300" />
                                    <span className="text-sm">Free delivery above ₹1500</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={20} className="text-saffron-300" />
                                    <span className="text-sm">100% genuine</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={20} className="text-saffron-300" />
                                    <span className="text-sm">24/7 pharmacist</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="hidden md:flex justify-center relative z-10"
                        >
                            <div className="relative w-[30rem] h-[30rem] lg:w-[35rem] lg:h-[35rem]">
                                {/* Pulse glow effect behind */}
                                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse blur-xl" />

                                {/* Animated Scooter Illustration */}
                                {/* Animated Scooter Illustration */}
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="relative bg-white/10 backdrop-blur-sm rounded-[2.5rem] border border-white/20 shadow-2xl p-4 ring-1 ring-white/30">
                                        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                                        <img
                                            src={heroScooter}
                                            alt="Fast Medicine Delivery"
                                            className="w-full h-full object-contain drop-shadow-lg rounded-[2rem]"
                                        />
                                    </div>
                                </motion.div>

                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                        <Link to="/search?q=" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            View all <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                        {CATEGORIES.map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={`/search?category=${encodeURIComponent(cat.name)}`}
                                    className="flex flex-col items-center p-4 rounded-2xl bg-white card-shadow card-shadow-hover transition-all group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Medicine Rows */}
            <MedicineRow title="Pain Relief Essentials" category="Pain Relief" delay={2} />
            <MedicineRow title="Vitamins & Supplements" category="Vitamins" delay={3} />
            <MedicineRow title="Diabetes Care" category="Diabetes" delay={4} />
            <MedicineRow title="Gastric & Digestion" category="Gastric" delay={5} />

            {/* Reviews Section */}
            <ReviewsSection />

            {/* Cities Section */}
            <section className="py-12 px-4 bg-gradient-to-br from-primary-50 to-teal-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Now Serving
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-sm mx-auto">
                        {TARGET_CITIES.map((city, i) => (
                            <motion.div
                                key={city.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl p-8 card-shadow text-center group hover:bg-primary-500 transition-all cursor-pointer"
                            >
                                <MapPin className="mx-auto text-primary-500 group-hover:text-white transition mb-3" size={32} />
                                <h3 className="font-bold text-xl text-gray-900 group-hover:text-white transition">{city.name}</h3>
                                <p className="text-gray-500 group-hover:text-primary-100 transition">{city.tagline}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-gray-900 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Need medicines urgently?
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        Upload your prescription and get genuine medicines delivered in 30-45 minutes
                    </p>
                    <Link
                        to="/prescriptions"
                        className="btn gradient-saffron text-white text-lg py-4 px-10 shadow-lg"
                    >
                        Upload Prescription →
                    </Link>
                </div>
            </section>
            {/* Floating Cart Button */}
            <FloatingCartButton />
        </div>
    );
}

function FloatingCartButton() {
    const { totalItems, subtotal } = useCartStore();
    const count = totalItems();
    const total = subtotal();

    if (count === 0) return null;

    return (
        <Link
            to="/cart"
            className="fixed bottom-6 right-6 bg-primary-600 text-white rounded-full p-4 shadow-2xl z-50 flex items-center gap-3 hover:scale-105 transition-transform border-4 border-white"
        >
            <div className="relative">
                <Truck size={24} />
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {count}
                </span>
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-medium text-primary-100">Total</span>
                <span className="text-sm font-bold">₹{total}</span>
            </div>
            <ChevronRight size={20} />
        </Link>
    );
}
