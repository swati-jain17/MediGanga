import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Clock, Sun, Sunset, Moon, Check, X, Plus, Bell,
    Package, AlertTriangle, ShoppingCart, Trash2
} from 'lucide-react';
import { remindersApi } from '../services/api';
import { useCartStore } from '../store/cartStore';

export default function RemindersPage() {
    const queryClient = useQueryClient();
    const { addItem } = useCartStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'reminders' | 'inventory'>('reminders');

    // Form state
    const [newReminder, setNewReminder] = useState({
        medicineName: '',
        dosage: '',
        scheduleTime: '09:00',
        schedulePeriod: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',
    });

    const { data: remindersData, isLoading } = useQuery({
        queryKey: ['reminders'],
        queryFn: async () => {
            const res = await remindersApi.getAll();
            return res.data.data;
        },
    });

    const { data: inventoryData } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await remindersApi.getInventory();
            return res.data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: () => remindersApi.create(newReminder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
            setShowAddModal(false);
            setNewReminder({ medicineName: '', dosage: '', scheduleTime: '09:00', schedulePeriod: 'morning' });
        },
    });

    const logActionMutation = useMutation({
        mutationFn: ({ id, action }: { id: string; action: 'taken' | 'skipped' }) =>
            remindersApi.logAction(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => remindersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });

    const getPeriodIcon = (period: string) => {
        switch (period) {
            case 'morning': return <Sun size={20} className="text-amber-500" />;
            case 'afternoon': return <Sun size={20} className="text-orange-500" />;
            case 'evening': return <Sunset size={20} className="text-purple-500" />;
            case 'night': return <Moon size={20} className="text-indigo-500" />;
            default: return <Clock size={20} />;
        }
    };

    const getPeriodColor = (period: string) => {
        switch (period) {
            case 'morning': return 'bg-amber-100 border-amber-200';
            case 'afternoon': return 'bg-orange-100 border-orange-200';
            case 'evening': return 'bg-purple-100 border-purple-200';
            case 'night': return 'bg-indigo-100 border-indigo-200';
            default: return 'bg-gray-100';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const grouped = remindersData?.grouped || { morning: [], afternoon: [], evening: [], night: [] };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Medicine Reminders</h1>
                            <p className="text-indigo-100">Never miss a dose</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                        >
                            <Plus size={24} />
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto px-4 -mt-4">
                <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-lg">
                    <button
                        onClick={() => setActiveTab('reminders')}
                        className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${activeTab === 'reminders' ? 'bg-indigo-500 text-white' : 'text-gray-600'
                            }`}
                    >
                        <Bell size={18} />
                        Daily Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${activeTab === 'inventory' ? 'bg-indigo-500 text-white' : 'text-gray-600'
                            }`}
                    >
                        <Package size={18} />
                        Inventory
                        {(inventoryData?.lowStockCount || 0) > 0 && (
                            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {inventoryData?.lowStockCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 mt-6">
                {activeTab === 'reminders' ? (
                    <div className="space-y-6">
                        {['morning', 'afternoon', 'evening', 'night'].map((period) => (
                            <motion.div
                                key={period}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    {getPeriodIcon(period)}
                                    <h3 className="font-bold text-gray-900 capitalize">{period}</h3>
                                    <span className="text-gray-400 text-sm">
                                        ({grouped[period as keyof typeof grouped]?.length || 0} medicines)
                                    </span>
                                </div>

                                {grouped[period as keyof typeof grouped]?.length === 0 ? (
                                    <div className={`rounded-2xl p-4 border-2 border-dashed ${getPeriodColor(period)}`}>
                                        <p className="text-gray-500 text-center text-sm">No medicines scheduled</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {grouped[period as keyof typeof grouped]?.map((reminder: any) => (
                                            <div
                                                key={reminder.id}
                                                className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getPeriodColor(period)}`}>
                                                        {getPeriodIcon(period)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{reminder.medicine_name}</h4>
                                                        <p className="text-gray-500 text-sm">
                                                            {reminder.dosage} • {reminder.schedule_time?.slice(0, 5)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => logActionMutation.mutate({ id: reminder.id, action: 'taken' })}
                                                        className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-200 transition"
                                                    >
                                                        <Check size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => logActionMutation.mutate({ id: reminder.id, action: 'skipped' })}
                                                        className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-200 transition"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMutation.mutate(reminder.id)}
                                                        className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-200 transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Low Stock Alert */}
                        {(inventoryData?.lowStock?.length || 0) > 0 && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="text-red-500" size={20} />
                                    <h3 className="font-bold text-red-800">Low Stock Alert</h3>
                                </div>
                                <div className="space-y-2">
                                    {inventoryData?.lowStock?.map((item: any) => (
                                        <div key={item.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.medicine_name}</p>
                                                <p className="text-red-600 text-sm">
                                                    Only {item.total_quantity - item.used_quantity} left
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => addItem({
                                                    medicineId: item.medicine_id,
                                                    name: item.medicine_name,
                                                    price: item.mrp || 0,
                                                    quantity: 1,
                                                    isGeneric: false,
                                                    originalPrice: item.mrp || 0,
                                                    scheduleType: 'OTC',
                                                    manufacturer: '',
                                                    imageUrl: '',
                                                })}
                                                className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-1 text-sm font-medium"
                                            >
                                                <ShoppingCart size={16} />
                                                Reorder
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Full Inventory */}
                        {inventoryData?.inventory?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No medicines in inventory</p>
                                <p className="text-gray-400 text-sm">Your ordered medicines will appear here</p>
                            </div>
                        ) : (
                            inventoryData?.inventory?.map((item: any) => (
                                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-bold text-gray-900">{item.medicine_name}</h4>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${(item.total_quantity - item.used_quantity) <= item.low_stock_threshold
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {item.total_quantity - item.used_quantity} left
                                        </span>
                                    </div>
                                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 rounded-full ${(item.total_quantity - item.used_quantity) <= item.low_stock_threshold
                                                ? 'bg-red-500'
                                                : 'bg-green-500'
                                                }`}
                                            style={{ width: `${((item.total_quantity - item.used_quantity) / item.total_quantity) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-gray-500 text-sm mt-2">
                                        {item.used_quantity} of {item.total_quantity} used
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Add Reminder Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Add Reminder</h3>
                                <button onClick={() => setShowAddModal(false)}>
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                                    <input
                                        type="text"
                                        value={newReminder.medicineName}
                                        onChange={(e) => setNewReminder({ ...newReminder, medicineName: e.target.value })}
                                        placeholder="e.g., Metformin 500mg"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                                    <input
                                        type="text"
                                        value={newReminder.dosage}
                                        onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                                        placeholder="e.g., 1 tablet"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            value={newReminder.scheduleTime}
                                            onChange={(e) => setNewReminder({ ...newReminder, scheduleTime: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                                        <select
                                            value={newReminder.schedulePeriod}
                                            onChange={(e) => setNewReminder({ ...newReminder, schedulePeriod: e.target.value as any })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="morning">Morning</option>
                                            <option value="afternoon">Afternoon</option>
                                            <option value="evening">Evening</option>
                                            <option value="night">Night</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={() => createMutation.mutate()}
                                    disabled={!newReminder.medicineName || createMutation.isPending}
                                    className="w-full bg-indigo-500 text-white py-4 rounded-xl font-bold disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Adding...' : 'Add Reminder'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
