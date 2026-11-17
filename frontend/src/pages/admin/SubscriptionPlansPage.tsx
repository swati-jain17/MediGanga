import { useState, useEffect } from 'react';
import {
    Plus,
    Crown,
    Check,
    Edit2,
    Trash2,
    Loader2,
    X
} from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { adminApi } from '../../services/api';

interface Plan {
    id: string;
    name: string; // internal name
    display_name: string;
    description: string;
    price_monthly: string;
    price_yearly: string;
    features: string[];
    badge_color: string;
    is_active: boolean;
}

export function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const addToast = useToastStore((state) => state.addToast);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getPlans();
            setPlans(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            addToast('Failed to load plans', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this plan?')) return;
        try {
            await adminApi.deletePlan(id);
            addToast('Plan deactivated', 'success');
            fetchPlans();
        } catch (error) {
            addToast('Failed to deactivate plan', 'error');
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPlan(null);
    };

    const handleSave = async (data: any) => {
        try {
            if (editingPlan) {
                await adminApi.updatePlan(editingPlan.id, data);
                addToast('Plan updated', 'success');
            } else {
                await adminApi.createPlan(data);
                addToast('Plan created', 'success');
            }
            fetchPlans();
            closeModal();
        } catch (error) {
            console.error(error);
            addToast('Failed to save plan', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                    <p className="text-gray-500">Manage membership tiers and benefits</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Create Plan
                </button>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden relative ${!plan.is_active ? 'opacity-60' : ''}`}>
                            {!plan.is_active && <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Inactive</div>}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{plan.display_name}</h3>
                                        <p className="text-sm text-gray-500">{plan.name}</p>
                                    </div>
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${plan.badge_color}20` }}>
                                        <Crown className="h-6 w-6" style={{ color: plan.badge_color }} />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mb-6 h-10 line-clamp-2">{plan.description}</p>

                                <div className="flex items-baseline mb-6">
                                    <span className="text-3xl font-bold text-gray-900">₹{plan.price_monthly}</span>
                                    <span className="text-gray-500 ml-1">/mo</span>
                                </div>
                                {plan.price_yearly && (
                                    <div className="text-sm text-green-600 font-medium mb-4">
                                        Yearly: ₹{plan.price_yearly}/yr
                                    </div>
                                )}

                                <ul className="space-y-3 mb-6">
                                    {plan.features?.map((feature, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-600">
                                            <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button onClick={() => handleEdit(plan)} className="flex-1 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium flex justify-center items-center gap-2">
                                        <Edit2 className="h-4 w-4" /> Edit
                                    </button>
                                    {plan.is_active && (
                                        <button onClick={() => handleDelete(plan.id)} className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium flex justify-center items-center gap-2">
                                            <Trash2 className="h-4 w-4" /> Deactivate
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <PlanModal
                    initialData={editingPlan}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function PlanModal({ initialData, onClose, onSave }: { initialData: Plan | null, onClose: () => void, onSave: (data: any) => void }) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        display_name: initialData?.display_name || '',
        description: initialData?.description || '',
        price_monthly: initialData?.price_monthly || '',
        price_yearly: initialData?.price_yearly || '',
        features: initialData?.features?.join('\n') || '',
        badge_color: initialData?.badge_color || '#6366f1',
        is_active: initialData?.is_active ?? true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            features: formData.features.split('\n').filter(f => f.trim())
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {initialData ? 'Edit Plan' : 'Create New Plan'}
                            </h3>
                            <button onClick={onClose}><X className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Internal Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                                    <input type="text" required value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (Monthly) ₹</label>
                                    <input type="number" required value={formData.price_monthly} onChange={e => setFormData({ ...formData, price_monthly: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (Yearly) ₹</label>
                                    <input type="number" value={formData.price_yearly} onChange={e => setFormData({ ...formData, price_yearly: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Features (One per line)</label>
                                <textarea value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} rows={4} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Free Delivery&#10;5% Off Medicines" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Badge Color (Hex)</label>
                                <div className="flex gap-2">
                                    <input type="color" value={formData.badge_color} onChange={e => setFormData({ ...formData, badge_color: e.target.value })} className="h-9 w-12 p-1 rounded border border-gray-300" />
                                    <input type="text" value={formData.badge_color} onChange={e => setFormData({ ...formData, badge_color: e.target.value })} className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                </div>
                            </div>
                            {initialData && (
                                <div className="flex items-center">
                                    <input id="active" type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Is Active Plan?</label>
                                </div>
                            )}
                            <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
                                <button type="button" onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm">Cancel</button>
                                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm">Save Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
