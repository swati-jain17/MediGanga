import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, Banknote, ChevronRight, AlertCircle, CheckCircle2, FileText, Zap } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { ordersApi } from '../services/api';
import { InteractionWarning } from '../components/cart/InteractionWarning';

type PaymentMethod = 'cod' | 'upi' | 'card' | 'phonepe';

interface Address {
    id: string;
    label: string;
    full: string;
    location: { latitude: number; longitude: number };
}

// Mock addresses for demo
const MOCK_ADDRESSES: Address[] = [
    {
        id: '1',
        label: 'Home',
        full: '123 Dashashwamedh Ghat Road, Varanasi, UP 221001',
        location: { latitude: 25.3109, longitude: 83.0107 },
    },
    {
        id: '2',
        label: 'Work',
        full: 'BHU Campus, Lanka, Varanasi, UP 221005',
        location: { latitude: 25.2677, longitude: 82.9913 },
    },
];

export function CheckoutPage() {
    const navigate = useNavigate();
    const { items, interactions, clearCart } = useCartStore();
    const subtotal = useCartStore(state => state.subtotal());
    const totalSavings = useCartStore(state => state.totalSavings());
    const requiresPrescription = useCartStore(state => state.requiresPrescription());

    const hasBlockingInteractions = useCartStore(state => state.hasBlockingInteractions());
    const hasEmergencyItems = useCartStore(state => state.hasEmergencyItems());

    const [selectedAddress, setSelectedAddress] = useState<Address | null>(MOCK_ADDRESSES[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
    const [acknowledgedInteractions, setAcknowledgedInteractions] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
    const [isPlacing, setIsPlacing] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

    const deliveryFee = subtotal >= 300 ? 0 : 29;
    const total = subtotal + deliveryFee;

    const hasMajorInteractions = interactions.some(i => i.severity === 'MAJOR');

    const canPlaceOrder =
        selectedAddress &&
        !hasBlockingInteractions &&
        (!hasMajorInteractions || acknowledgedInteractions) &&
        (!requiresPrescription || selectedPrescription);

    const handlePlaceOrder = async () => {
        if (!canPlaceOrder || !selectedAddress) return;

        setIsPlacing(true);
        setError('');

        try {
            const orderData = {
                items: items.map(item => ({
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    price: item.price,
                    isGeneric: item.isGeneric,
                })),
                deliveryAddress: selectedAddress.full,
                deliveryLocation: selectedAddress.location,
                prescriptionId: selectedPrescription || undefined,
                acknowledgedInteractions,
            };

            const response = await ordersApi.create(orderData);

            if (response.data.success || response.status === 201) {
                const orderId = response.data.data?.orderId || response.data.data?.id;

                if (paymentMethod === 'phonepe' || paymentMethod === 'upi' || paymentMethod === 'card') {
                    // Initiate payment
                    // Ideally, we pass the payment method preference to backend if it handles initiation differently
                    // For now, we only have 'phonepe' distinct handling

                    try {
                        // We need to call initiate payment endpoint separately or if createOrder returned payment link we use it.
                        // Assuming ordersApi.initiatePayment exists or we call it.
                        // ordersApi.create currently just creates the order.
                        // We need to initiate payment if method is online.

                        // NOTE: You might need to add initiatePayment to ordersApi in api.ts
                        const paymentResponse = await ordersApi.initiatePayment(orderId, paymentMethod === 'phonepe' ? 'phonepe' : 'razorpay');

                        if (paymentResponse.data.success) {
                            if (paymentMethod === 'phonepe') {
                                // Redirect to PhonePe
                                window.location.href = paymentResponse.data.data.redirectUrl;
                                return; // Stop here, redirecting
                            } else {
                                // Existing Razorpay logic (if any specific, otherwise default)
                                // If paymentResponse.data.data contains Razorpay order details
                                // We would open Razorpay modal here. 
                                // For now, assume we just redirect or show success for demo if not full impl.
                                clearCart();
                                setPlacedOrderId(orderId);
                                setShowSuccessModal(true);
                            }
                        }
                    } catch (payErr) {
                        console.error("Payment initiation failed", payErr);
                        setError("Order created but payment initiation failed. Please pay from Orders page.");
                        clearCart();
                        setPlacedOrderId(orderId);
                        setShowSuccessModal(true); // Still show success as order exists, user can pay later
                    }
                } else {
                    // COD
                    clearCart();
                    setPlacedOrderId(orderId);
                    setShowSuccessModal(true);
                }
            } else {
                throw new Error('Order creation failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to place order');
        } finally {
            setIsPlacing(false);
        }
    };

    const handleCloseSuccessModal = () => {
        if (placedOrderId) {
            navigate(`/orders/${placedOrderId}`);
        }
    };

    if (items.length === 0 && !placedOrderId) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Emergency Priority Banner */}
                    {hasEmergencyItems && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm animate-pulse">
                            <div className="bg-amber-100 p-3 rounded-full">
                                <Zap className="text-amber-600 fill-current" size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 text-lg">Priority Emergency Delivery</h4>
                                <p className="text-amber-700">
                                    Your order contains emergency items. We've upgraded this to <span className="font-bold">Lightning Priority Delivery</span> to ensure fastest arrival.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Delivery Address */}
                    <section className="bg-white rounded-2xl p-5 card-shadow">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-primary-500" />
                            Delivery Address
                        </h2>

                        <div className="space-y-3">
                            {MOCK_ADDRESSES.map((addr) => (
                                <motion.button
                                    key={addr.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedAddress(addr)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition ${selectedAddress?.id === addr.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium text-gray-900">{addr.label}</span>
                                            <p className="text-sm text-gray-500 mt-1">{addr.full}</p>
                                        </div>
                                        {selectedAddress?.id === addr.id && (
                                            <CheckCircle2 className="text-primary-500" size={20} />
                                        )}
                                    </div>
                                </motion.button>
                            ))}

                            <button
                                onClick={() => navigate('/profile/addresses', { state: { returnTo: '/checkout' } })}
                                className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary-500 hover:text-primary-600 transition flex items-center justify-center gap-2"
                            >
                                + Add New Address
                            </button>
                        </div>
                    </section>

                    {/* Prescription Selection */}
                    {requiresPrescription && (
                        <section className="bg-white rounded-2xl p-5 card-shadow">
                            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-saffron-500" />
                                Prescription Required
                            </h2>

                            <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-4 mb-4">
                                <p className="text-saffron-800 text-sm">
                                    Some items in your cart require a valid prescription. Please select or upload one.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setSelectedPrescription('mock-prescription')}
                                    className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${selectedPrescription
                                        ? 'border-ayurveda-500 bg-ayurveda-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FileText size={24} className="text-gray-500" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">Prescription from Jan 15</p>
                                            <p className="text-sm text-gray-500">Valid until Feb 14</p>
                                        </div>
                                    </div>
                                    {selectedPrescription && (
                                        <CheckCircle2 className="text-ayurveda-500" size={20} />
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate('/prescriptions')}
                                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-saffron-500 hover:text-saffron-600 transition"
                                >
                                    + Upload New Prescription
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Drug Interactions */}
                    {interactions.length > 0 && (
                        <section className="bg-white rounded-2xl p-5 card-shadow">
                            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle size={20} className="text-orange-500" />
                                Drug Interactions
                            </h2>
                            <InteractionWarning
                                interactions={interactions}
                                onAcknowledge={() => setAcknowledgedInteractions(true)}
                                showAcknowledgeButton={!acknowledgedInteractions && hasMajorInteractions}
                            />
                            {acknowledgedInteractions && (
                                <p className="mt-3 text-sm text-ayurveda-600 flex items-center gap-1">
                                    <CheckCircle2 size={16} />
                                    You've acknowledged the interaction warnings
                                </p>
                            )}
                        </section>
                    )}

                    {/* Payment Method */}
                    <section className="bg-white rounded-2xl p-5 card-shadow">
                        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-primary-500" />
                            Payment Method
                        </h2>

                        <div className="space-y-3">
                            <button
                                onClick={() => setPaymentMethod('cod')}
                                className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'cod'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Banknote size={24} className="text-ayurveda-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                                        <p className="text-sm text-gray-500">Pay when you receive</p>
                                    </div>
                                </div>
                                {paymentMethod === 'cod' && <CheckCircle2 className="text-primary-500" size={20} />}
                            </button>

                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'upi'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                        UPI
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">UPI Payment</p>
                                        <p className="text-sm text-gray-500">GPay, PhonePe, Paytm</p>
                                    </div>
                                </div>
                                {paymentMethod === 'upi' && <CheckCircle2 className="text-primary-500" size={20} />}
                            </button>

                            <button
                                onClick={() => setPaymentMethod('phonepe')}
                                className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'phonepe'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center p-1">
                                        <img src="https://phonepe.com/static/icon-512.png" alt="PhonePe" className="w-full h-full object-contain" onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerText = 'Pe';
                                        }} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">PhonePe</p>
                                        <p className="text-sm text-gray-500">UPI, Wallet, Card</p>
                                    </div>
                                </div>
                                {paymentMethod === 'phonepe' && <CheckCircle2 className="text-purple-500" size={20} />}
                            </button>

                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'card'
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard size={24} className="text-blue-600" />
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Credit / Debit Card</p>
                                        <p className="text-sm text-gray-500">Visa, Mastercard, RuPay</p>
                                    </div>
                                </div>
                                {paymentMethod === 'card' && <CheckCircle2 className="text-primary-500" size={20} />}
                            </button>
                        </div>
                    </section>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-5 card-shadow sticky top-24">
                        <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>

                        {/* Items preview */}
                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                            {items.map(item => (
                                <div key={item.medicineId} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate flex-1">{item.name} × {item.quantity}</span>
                                    <span className="font-medium ml-2">₹{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>₹{subtotal.toFixed(0)}</span>
                            </div>
                            {totalSavings > 0 && (
                                <div className="flex justify-between text-ayurveda-600">
                                    <span>Generic Savings</span>
                                    <span>-₹{totalSavings.toFixed(0)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery</span>
                                <span className={deliveryFee === 0 ? 'text-ayurveda-600' : ''}>
                                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3 mt-3">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>₹{total.toFixed(0)}</span>
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-sm mt-3"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={!canPlaceOrder || isPlacing}
                            className="w-full btn btn-primary mt-4 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isPlacing ? (
                                '⏳ Placing Order...'
                            ) : (
                                <>
                                    Place Order
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>

                        {!canPlaceOrder && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                                {hasBlockingInteractions && 'Remove conflicting medicines'}
                                {hasMajorInteractions && !acknowledgedInteractions && 'Acknowledge interactions'}
                                {requiresPrescription && !selectedPrescription && 'Select a prescription'}
                            </p>
                        )}

                        {/* Delivery estimate */}
                        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">Estimated delivery</p>
                            <p className="font-bold text-primary-600">30-45 minutes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
                        >
                            {hasEmergencyItems ? (
                                <>
                                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                        <Zap size={40} className="text-amber-600 fill-current" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Priority Order Confirmed! ⚡️</h2>
                                    <p className="text-gray-500 mb-6">
                                        Priority medicine ordered will be delivered in <span className="font-bold text-gray-900">15-20 minutes</span>.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} className="text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                                    <p className="text-gray-500 mb-6">
                                        Your order has been successfully placed and will be delivered in 30-45 minutes.
                                    </p>
                                </>
                            )}

                            <button
                                onClick={handleCloseSuccessModal}
                                className={`w-full btn py-4 rounded-xl font-bold text-lg ${hasEmergencyItems ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'btn-primary'
                                    }`}
                            >
                                Track Order
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
