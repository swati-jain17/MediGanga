import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../services/api';

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
    placed: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
    verified: { color: 'text-purple-600', bg: 'bg-purple-100', icon: CheckCircle2 },
    preparing: { color: 'text-saffron-600', bg: 'bg-saffron-100', icon: Package },
    out_for_delivery: { color: 'text-primary-600', bg: 'bg-primary-100', icon: Package },
    delivered: { color: 'text-ayurveda-600', bg: 'bg-ayurveda-100', icon: CheckCircle2 },
    cancelled: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};

export function OrdersPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await ordersApi.getAll();
            return response.data.data || [];
        },
    });

    const activeOrders = orders?.filter((o: any) =>
        ['placed', 'verified', 'preparing', 'out_for_delivery'].includes(o.status)
    ) || [];

    const pastOrders = orders?.filter((o: any) =>
        ['delivered', 'cancelled'].includes(o.status)
    ) || [];

    const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${activeTab === 'active'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-500'
                        }`}
                >
                    Active ({activeOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${activeTab === 'past'
                            ? 'bg-white text-gray-900 shadow'
                            : 'text-gray-500'
                        }`}
                >
                    Past ({pastOrders.length})
                </button>
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-4 card-shadow animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayOrders.length > 0 ? (
                <div className="space-y-4">
                    {displayOrders.map((order: any) => {
                        const config = statusConfig[order.status] || statusConfig.placed;
                        const IconComponent = config.icon;

                        return (
                            <motion.button
                                key={order.id}
                                onClick={() => navigate(`/orders/${order.id}`)}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-white rounded-xl p-4 card-shadow text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center`}>
                                        <IconComponent className={config.color} size={24} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">
                                                Order #{order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <ChevronRight className="text-gray-400" size={20} />
                                        </div>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {order.item_count} items • ₹{order.total_amount}
                                        </p>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                                {order.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Package className="text-gray-300 mx-auto mb-4" size={64} />
                    <p className="text-gray-500 mb-4">
                        {activeTab === 'active' ? 'No active orders' : 'No past orders'}
                    </p>
                    <button
                        onClick={() => navigate('/search')}
                        className="btn btn-primary"
                    >
                        Browse Medicines
                    </button>
                </div>
            )}
        </div>
    );
}
