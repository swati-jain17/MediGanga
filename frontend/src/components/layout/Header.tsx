import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, MapPin, X, Package, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import medigangaLogoNew from '../../assets/images/mediganga-logo-new.png';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const totalItems = useCartStore(state => state.totalItems());
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const isHome = location.pathname === '/';

    return (
        <header className="sticky top-0 z-50 glass border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Top row */}
                <div className="flex items-center justify-between gap-4">
                    {/* Left Section: Back Button OR Logo */}
                    <div className="flex items-center gap-3">
                        {!isHome && (
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition mr-2 md:hidden"
                                aria-label="Go back"
                            >
                                <ArrowLeft size={24} className="text-gray-700" />
                            </button>
                        )}

                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                {/* Logo Glow */}
                                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <img
                                    src={medigangaLogoNew}
                                    alt="MediGanga"
                                    className="h-10 w-auto object-contain relative transform group-hover:scale-105 transition-transform duration-300 rounded-full"
                                />
                            </div>
                            <div className="hidden sm:block">
                                <p className="font-bold text-gray-900 text-sm leading-none">Seamless Delivery</p>
                                <p className="text-xs text-gray-500">30-45 min delivery <span className="text-xs text-red-500 font-mono">(v3.0 Updated)</span></p>
                            </div>
                        </Link>
                    </div>

                    {/* Search bar - desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search medicines, health products..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                            />
                        </div>
                    </form>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        {/* Location */}
                        <button className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition">
                            <MapPin size={18} className="text-primary-500" />
                            <span className="max-w-[100px] truncate">Varanasi</span>
                        </button>
                        {/* Track Order */}
                        <Link
                            to="/orders"
                            className="hidden sm:flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition mr-2"
                            title="Track Order"
                        >
                            <Package size={20} className="text-gray-600 group-hover:text-primary-600" />
                            <span className="hidden lg:inline">Track Order</span>
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                        >
                            <ShoppingCart size={22} className="text-gray-700" />
                            {totalItems > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-coral-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                                >
                                    {totalItems}
                                </motion.span>
                            )}
                        </Link>

                        {/* Profile */}
                        <Link
                            to={isAuthenticated ? '/profile' : '/login'}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                        >
                            <User size={22} className="text-gray-700" />
                        </Link>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Search bar - mobile */}
                <form onSubmit={handleSearch} className="md:hidden mt-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search medicines..."
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 transition text-sm"
                        />
                    </div>
                </form>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-3 space-y-2">
                            <Link to="/membership" className="block py-2 text-primary-600 font-semibold hover:text-primary-700" onClick={() => setIsMenuOpen(false)}>
                                MediGanga Plus 👑
                            </Link>
                            <Link to="/orders" className="block py-2 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                                My Orders
                            </Link>
                            <Link to="/prescriptions" className="block py-2 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                                Prescriptions
                            </Link>
                            <Link to="/ayurveda" className="block py-2 text-gray-700 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>
                                Ayurveda Corner
                            </Link>
                            {!isHome && (
                                <button onClick={() => { setIsMenuOpen(false); navigate(-1); }} className="flex w-full items-center gap-2 py-2 text-gray-700 hover:text-primary-600">
                                    <ArrowLeft size={16} />
                                    Go Back
                                </button>
                            )}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
