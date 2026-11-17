import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, AlertTriangle, Trash2, FileText, Zap } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { CartItem } from '../components/cart/CartItem';
import { InteractionWarning } from '../components/cart/InteractionWarning';

export function CartPage() {
    const navigate = useNavigate();
    const {
        items,
        interactions,
        isCheckingInteractions,
        clearCart
    } = useCartStore();

    const subtotal = useCartStore(state => state.subtotal());
    const totalSavings = useCartStore(state => state.totalSavings());
    const requiresPrescription = useCartStore(state => state.requiresPrescription());
    const hasBlockingInteractions = useCartStore(state => state.hasBlockingInteractions());
    const hasEmergencyItems = useCartStore(state => state.hasEmergencyItems());

    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6"
                    >
                        <ShoppingBag size={40} className="text-gray-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add medicines to your cart and they'll appear here</p>
                    <Link to="/" className="btn btn-primary">
                        Browse Medicines
                    </Link>
                </div>
            </div>
        );
    }

    const deliveryFee = 29;
    const total = subtotal + deliveryFee;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
                <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
                >
                    <Trash2 size={16} />
                    Clear All
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Emergency Priority Banner */}
                    {hasEmergencyItems && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-sm animate-pulse">
                            <div className="bg-amber-100 p-2 rounded-full">
                                <Zap className="text-amber-600 fill-current" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900">Priority Emergency Delivery</h4>
                                <p className="text-amber-700 text-sm">
                                    Your order contains emergency items. We've upgraded this to <span className="font-bold">Lightning Priority Delivery</span>.
                                </p>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {items.map(item => (
                            <CartItem key={item.medicineId} item={item} />
                        ))}
                    </AnimatePresence>

                    {/* Prescription Notice */}
                    {requiresPrescription && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-saffron-50 border-2 border-saffron-400 rounded-xl p-4"
                        >
                            <div className="flex items-start gap-3">
                                <FileText className="text-saffron-600 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-saffron-900">Prescription Required</h4>
                                    <p className="text-saffron-700 text-sm mt-1">
                                        Some items in your cart require a valid prescription. Please upload during checkout.
                                    </p>
                                    <Link
                                        to="/prescriptions"
                                        className="inline-block mt-2 text-sm font-medium text-saffron-600 hover:text-saffron-700"
                                    >
                                        Upload Prescription →
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Interaction Warnings */}
                    {interactions.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <AlertTriangle className="text-orange-500" size={20} />
                                Drug Interaction Warnings
                            </h3>
                            <InteractionWarning interactions={interactions} showAcknowledgeButton={false} />
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 card-shadow sticky top-24">
                        <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                            </div>

                            {totalSavings > 0 && (
                                <div className="flex justify-between text-ayurveda-600">
                                    <span>Generic Savings</span>
                                    <span className="font-medium">-₹{totalSavings.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-medium">₹{deliveryFee}</span>
                            </div>

                            <div className="border-t border-gray-100 pt-3 mt-3" />

                            <div className="flex justify-between text-lg">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-gray-900">₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <button
                            onClick={handleCheckout}
                            disabled={hasBlockingInteractions || isCheckingInteractions}
                            className="w-full btn btn-primary mt-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCheckingInteractions ? (
                                '⏳ Checking interactions...'
                            ) : hasBlockingInteractions ? (
                                'Cannot Proceed — Dangerous Interaction'
                            ) : (
                                <>
                                    Proceed to Checkout
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        {hasBlockingInteractions && (
                            <p className="text-sm text-red-500 text-center mt-3">
                                Remove conflicting medicines to proceed
                            </p>
                        )}

                        {/* Free delivery threshold */}
                        {subtotal < 1500 && (
                            <p className="text-sm text-gray-500 text-center mt-4">
                                Add ₹{(1500 - subtotal).toFixed(0)} more for <span className="font-medium text-ayurveda-600">FREE delivery</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
