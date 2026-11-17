import { useEffect, useState } from 'react';
import {
    ShoppingBag,
    Users,
    FileText,
    AlertTriangle,
    TrendingUp,
    CreditCard
} from 'lucide-react';
import { adminApi } from '../../services/api';

interface DashboardStats {
    orders: {
        total: number;
        today: number;
        week: number;
        todayRevenue: number;
        totalRevenue: number;
    };
    prescriptions: {
        pending: number;
    };
    users: {
        total: number;
        newToday: number;
    };
    inventory: {
        lowStock: number;
    };
}

export function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminApi.getDashboardStats();
                setStats(response.data.data || null);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full border border-green-200 uppercase tracking-wider">
                        Using adminApi (Refactored)
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200 uppercase tracking-wider">
                        v3.3 (Subscription Fix Applied)
                    </span>
                </div>
                <p className="text-gray-500">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₹{stats.orders.todayRevenue.toLocaleString()}
                            </p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-500">Total: ₹{stats.orders.totalRevenue.toLocaleString()}</span>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">New Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.orders.today}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-500">{stats.orders.week} this week</span>
                    </div>
                </div>

                {/* Pending Prescriptions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.prescriptions.pending}</p>
                        </div>
                        <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                            <FileText className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-orange-600 font-medium">Action Required</span>
                    </div>
                </div>

                {/* Users */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                        </div>
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-500">+{stats.users.newToday} today</span>
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
                        <p className="text-gray-500 text-sm">{stats.inventory.lowStock} medicines below threshold</p>
                    </div>
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">Active Subscriptions</h3>
                        <p className="text-gray-500 text-sm">Manage recurring plans</p>
                    </div>
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <CreditCard className="h-5 w-5" />
                    </div>
                </div>
            </div>

        </div>
    );
}
