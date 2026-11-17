import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCart() {
    const totalItems = useCartStore(state => state.totalItems());
    const subtotal = useCartStore(state => state.subtotal());
    const location = useLocation();

    // Hide on Cart, Checkout, Login, and specific Order pages
    const hiddenPaths = ['/cart', '/checkout', '/login', '/orders'];
    const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

    if (totalItems === 0 || shouldHide) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-24 left-4 right-4 z-40 md:hidden"
            >
                <Link to="/cart">
                    <div className="bg-primary-600 text-white p-4 rounded-xl shadow-lg shadow-primary-600/30 flex items-center justify-between backdrop-blur-md bg-opacity-95">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg relative">
                                <ShoppingBag size={24} />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary-600">
                                    {totalItems}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-xs text-primary-100">{totalItems} items</span>
                                <span className="font-bold text-lg">₹{subtotal.toFixed(0)}</span>
                            </div>
                        </div>
                        <div className="flex items-center font-bold">
                            View Cart <ChevronRight size={20} />
                        </div>
                    </div>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
