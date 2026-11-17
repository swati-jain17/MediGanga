import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

interface Order {
    id: string;
    user_name: string;
    user_email: string;
    user_phone: string;
    total_amount: number;
    status: string;
    created_at: string;
    items?: OrderItem[];
    delivery_address: string;
}

interface OrderItem {
    id: string;
    medicine_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { token } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log('Fetching orders...');
            const response = await adminApi.getOrders({ status: statusFilter, search, page, limit: 10 });
            console.log('Orders Response:', response.data);
            setOrders(response.data.data || []);
            // @ts-ignore
            if (response.data.pagination) {
                // @ts-ignore
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            addToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [statusFilter, page, search, token]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            addToast('Order status updated', 'success');
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error('Update failed:', error);
            addToast('Failed to update status', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'placed': return 'bg-blue-100 text-blue-800';
            case 'verified': return 'bg-indigo-100 text-indigo-800';
            case 'preparing': return 'bg-yellow-100 text-yellow-800';
            case 'ready_for_pickup': return 'bg-orange-100 text-orange-800';
            case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-500">Track and manage customer orders</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="placed">Placed</option>
                        <option value="verified">Verified</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No orders found matching your criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{order.user_name || 'Guest'}</div>
                                            <div className="text-sm text-gray-500">{order.user_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ₹{order.total_amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md text-sm transition-colors"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {orders.length > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span></p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateStatus={handleStatusUpdate}
                />
            )}
        </div>
    );
}

function OrderDetailsModal({ order, onClose, onUpdateStatus }: { order: Order; onClose: () => void; onUpdateStatus: (id: string, status: string) => void }) {
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [fullOrder, setFullOrder] = useState<Order>(order);
    const { token } = useAuthStore();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoadingDetails(true);
                const response = await adminApi.getOrderDetails(order.id);
                setFullOrder(response.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingDetails(false);
            }
        };
        fetchDetails();
    }, [order.id, token]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Order #{order.id.slice(0, 8)}
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className="font-semibold text-gray-900 capitalize">{fullOrder.status.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-semibold text-gray-900">{fullOrder.user_name}</p>
                                        <p className="text-xs text-gray-500">{fullOrder.user_phone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Delivery Address</p>
                                        <p className="text-sm text-gray-900">{fullOrder.delivery_address}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 py-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                                    {loadingDetails ? (
                                        <div className="flex justify-center py-4"><Loader2 className="animate-spin h-6 w-6" /></div>
                                    ) : (
                                        <div className="space-y-3">
                                            {fullOrder.items?.map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <div className="flex items-start max-w-[70%]">
                                                        <span className="font-medium text-gray-900 mr-2">{item.quantity}x</span>
                                                        <span className="text-gray-600">{item.medicine_name}</span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">₹{item.total_price}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-gray-900">
                                                <span>Total</span>
                                                <span>₹{fullOrder.total_amount}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-900 mb-2">Update Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['verified', 'preparing', 'out_for_delivery', 'delivered'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => onUpdateStatus(fullOrder.id, status)}
                                                disabled={fullOrder.status === status}
                                                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors
                                                   ${fullOrder.status === status
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                {status.replace(/_/g, ' ').toUpperCase()}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => onUpdateStatus(fullOrder.id, 'cancelled')}
                                            className="px-3 py-1.5 rounded text-xs font-medium border border-red-300 text-red-700 bg-white hover:bg-red-50"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
