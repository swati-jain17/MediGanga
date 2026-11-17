import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Clock, MapPin } from 'lucide-react';

interface Props {
    orderId: string;
    estimatedMinutes?: number;
}

export function OrderSuccessPage({ orderId, estimatedMinutes = 12 }: Props) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ayurveda-50 to-primary-50 px-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full card-shadow text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 bg-ayurveda-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle2 className="text-ayurveda-500" size={48} />
                </motion.div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
                <p className="text-gray-500 mb-6">
                    Your medicines are on their way
                </p>

                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-500">Order ID</span>
                        <span className="font-mono font-medium">{orderId.slice(0, 8).toUpperCase()}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Package className="text-primary-600" size={20} />
                            </div>
                            <p className="text-xs text-gray-500">Preparing</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-saffron-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock className="text-saffron-600" size={20} />
                            </div>
                            <p className="text-xs text-gray-500">{estimatedMinutes} min</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-ayurveda-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <MapPin className="text-ayurveda-600" size={20} />
                            </div>
                            <p className="text-xs text-gray-500">Tracking</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/orders/${orderId}`)}
                    className="w-full btn btn-primary py-4 mb-3"
                >
                    Track Order
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="w-full btn bg-gray-100 text-gray-700 hover:bg-gray-200 py-3"
                >
                    Continue Shopping
                </button>
            </motion.div>
        </div>
    );
}
