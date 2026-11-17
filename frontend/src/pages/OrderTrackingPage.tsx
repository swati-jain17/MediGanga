import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, MapPin, Phone, CheckCircle2, Truck, ChefHat, ClipboardCheck, XCircle } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useToastStore } from '../store/toastStore';
import { ordersApi } from '../services/api';
import { trackOrder, stopTrackingOrder, onRiderLocation, onOrderStatus, connectSocket, disconnectSocket } from '../services/websocket';
import type { OrderStatus } from '../types';
import { LiveTrackingMap } from '../components/orders/LiveTrackingMap';

const STATUS_CONFIG: Record<OrderStatus, { icon: any; label: string; color: string; description: string }> = {
    placed: { icon: ClipboardCheck, label: 'Order Placed', color: 'text-blue-500', description: 'Your order has been received' },
    verified: { icon: CheckCircle2, label: 'Verified', color: 'text-teal-500', description: 'Prescription and details verified' },
    preparing: { icon: ChefHat, label: 'Preparing', color: 'text-saffron-500', description: 'Medicines being packed' },
    ready_for_pickup: { icon: Package, label: 'Ready', color: 'text-purple-500', description: 'Ready for delivery partner' },
    out_for_delivery: { icon: Truck, label: 'Out for Delivery', color: 'text-primary-500', description: 'On the way to you' },
    delivered: { icon: CheckCircle2, label: 'Delivered', color: 'text-ayurveda-500', description: 'Successfully delivered' },
    cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-red-500', description: 'Order was cancelled' },
};

const STATUS_ORDER: OrderStatus[] = ['placed', 'verified', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];

function Countdown({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState<{ m: number; s: number } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                return {
                    m: Math.floor((difference / 1000 / 60)),
                    s: Math.floor((difference / 1000) % 60),
                };
            }
            return { m: 0, s: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return <span>--:--</span>;

    return (
        <span>
            {String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
            <span className="text-sm font-normal text-gray-500 ml-2">min</span>
        </span>
    );
}

export function OrderTrackingPage() {
    const { id } = useParams<{ id: string }>();
    const { currentOrder, isLoading, fetchOrderById, setRiderLocation, updateOrderStatus, riderLocation } = useOrderStore();
    const location = useLocation();
    const navigate = useNavigate();
    const addToast = useToastStore(state => state.addToast);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const source = query.get('source');
        const transactionId = query.get('transactionId');

        if (source === 'phonepe' && transactionId && id) {
            // Verify payment
            const verifyPayment = async () => {
                try {
                    const response = await ordersApi.checkPhonePeStatus(id, transactionId);
                    if (response.data.success && response.data.data?.status === 'paid') {
                        addToast('Payment Successful!', 'success');
                        // Refresh order details
                        fetchOrderById(id);
                    } else if (response.data.data?.status === 'pending') {
                        addToast('Payment is pending. Please check back later.', 'info');
                    } else {
                        addToast('Payment Failed or Verification Failed.', 'error');
                    }
                } catch (error) {
                    console.error('Verification failed', error);
                    addToast('Failed to verify payment.', 'error');
                } finally {
                    // Clean URL
                    navigate(`/orders/${id}`, { replace: true });
                }
            };

            verifyPayment();
        }
    }, [location.search, id]);

    useEffect(() => {
        if (id) {
            fetchOrderById(id);
            connectSocket();
            trackOrder(id);

            const unsubLocation = onRiderLocation((data) => {
                setRiderLocation({ latitude: data.latitude, longitude: data.longitude });
            });

            const unsubStatus = onOrderStatus((data) => {
                updateOrderStatus(data.status as OrderStatus);
            });

            return () => {
                stopTrackingOrder(id);
                disconnectSocket();
                unsubLocation();
                unsubStatus();
            };
        }
    }, [id]);

    if (isLoading || !currentOrder) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="bg-white rounded-2xl p-6 card-shadow space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-40 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const currentStatusIndex = STATUS_ORDER.indexOf(currentOrder.status);
    const statusConfig = STATUS_CONFIG[currentOrder.status];

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link to="/orders" className="text-primary-600 font-medium mb-2 inline-block">← Back to Orders</Link>
                <h1 className="text-2xl font-bold text-gray-900">Order #{currentOrder.id.slice(0, 8)}</h1>
                <p className="text-gray-500 text-sm">
                    Placed on {new Date(currentOrder.created_at).toLocaleDateString('en-IN', {
                        dateStyle: 'medium'
                    })}
                </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end mb-6">
                {currentOrder.status === 'placed' && (
                    <button
                        onClick={async () => {
                            if (confirm('Are you sure you want to cancel this order?')) {
                                // Use store action which handles API + State update
                                const success = await useOrderStore.getState().cancelOrder(currentOrder.id, 'User requested cancellation');
                                if (!success) {
                                    alert('Failed to cancel order. Please try again.');
                                }
                            }
                        }}
                        className="text-red-600 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition border border-red-200"
                    >
                        Cancel Order
                    </button>
                )}
            </div>

            {/* Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 card-shadow mb-6"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center ${statusConfig.color}`}>
                        <statusConfig.icon size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{statusConfig.label}</h2>
                        <p className="text-gray-500">{statusConfig.description}</p>
                    </div>
                </div>

                {/* Progress Steps */}
                {currentOrder.status === 'cancelled' ? (
                    <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <XCircle className="text-red-500" size={24} />
                        </div>
                        <h3 className="font-bold text-red-700">Order Cancelled</h3>
                        <p className="text-red-600 text-sm">This order has been cancelled and will not be delivered.</p>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded" />
                        <div
                            className="absolute top-5 left-5 h-1 bg-primary-500 rounded transition-all duration-500"
                            style={{ width: `${(currentStatusIndex / (STATUS_ORDER.length - 1)) * 100}%` }}
                        />

                        <div className="relative flex justify-between">
                            {STATUS_ORDER.map((status, index) => {
                                const config = STATUS_CONFIG[status];
                                const isActive = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;

                                return (
                                    <div key={status} className="flex flex-col items-center">
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: isCurrent ? 1.1 : 1 }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
                                                } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}
                                        >
                                            <config.icon size={18} />
                                        </motion.div>
                                        <span className={`text-xs mt-2 text-center ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ETA & Timer */}
                {currentOrder.estimated_delivery && currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-3 text-lg">
                            <Clock className="text-primary-500" size={24} />
                            <span className="font-medium text-gray-900">
                                Estimated delivery by{' '}
                                <span className="text-primary-600 font-bold">
                                    {new Date(currentOrder.estimated_delivery).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </span>
                        </div>
                        {/* Countdown Timer */}
                        <div className="text-3xl font-bold font-mono text-gray-800 bg-gray-100 px-6 py-2 rounded-xl border-2 border-primary-100 mt-2">
                            <Countdown targetDate={currentOrder.estimated_delivery} />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Live Map */}
            {
                (currentOrder.status === 'out_for_delivery' || currentOrder.status === 'ready_for_pickup') && (
                    <div className="mb-6">
                        <LiveTrackingMap
                            riderLocation={riderLocation}
                            deliveryLocation={{ latitude: currentOrder.delivery_latitude, longitude: currentOrder.delivery_longitude }}
                        />
                    </div>
                )
            }

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-5 card-shadow mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-primary-500" />
                    Delivery Address
                </h3>
                <p className="text-gray-700">{currentOrder.delivery_address}</p>
            </div>

            {/* Dark Store Info */}
            <div className="bg-white rounded-2xl p-5 card-shadow mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Delivered from</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">{currentOrder.dark_store_name}</p>
                        <p className="text-sm text-gray-500">{currentOrder.dark_store_address}</p>
                    </div>
                    {currentOrder.dark_store_phone && (
                        <a
                            href={`tel:${currentOrder.dark_store_phone}`}
                            className="p-3 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-200 transition"
                        >
                            <Phone size={20} />
                        </a>
                    )}
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-5 card-shadow mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                    {currentOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <span className="font-bold text-primary-500">{item.medicine_name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{item.medicine_name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <span className="font-medium text-gray-900">₹{item.total_price}</span>
                        </div>
                    ))}
                </div>

                {/* Price Summary */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₹{currentOrder.subtotal}</span>
                    </div>
                    {currentOrder.generic_savings > 0 && (
                        <div className="flex justify-between text-sm text-ayurveda-600">
                            <span>Generic Savings</span>
                            <span>-₹{currentOrder.generic_savings}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery</span>
                        <span>₹{currentOrder.delivery_fee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>₹{currentOrder.total_amount}</span>
                    </div>
                </div>
            </div>
        </div >
    );
}
