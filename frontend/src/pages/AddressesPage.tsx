import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Trash2, Edit2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function AddressesPage() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        type: 'Home',
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
    });

    const addresses = user?.addresses || [];

    const locationState = useLocation().state as { returnTo?: string } | undefined;

    const handleSave = () => {
        if (!formData.houseNo || !formData.street || !formData.city || !formData.pincode) {
            alert('Please fill all required fields');
            return;
        }

        const newAddress: any = {
            id: formData.id || Date.now().toString(),
            label: formData.type,
            full_address: `${formData.houseNo}, ${formData.street}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city} - ${formData.pincode}`,
            location: { latitude: 0, longitude: 0 }, // Default or Geocode later
            is_default: false,
            // Spread other fields safely
            type: formData.type,
            houseNo: formData.houseNo,
            street: formData.street,
            landmark: formData.landmark,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
        };

        const updatedAddresses = formData.id
            ? addresses.map(addr => addr.id === formData.id ? newAddress : addr)
            : [...addresses, newAddress];

        updateUser({ addresses: updatedAddresses });
        setShowForm(false);
        resetForm();

        if (locationState?.returnTo) {
            navigate(locationState.returnTo);
        }
    };

    const handleDelete = (id: string) => {
        const updatedAddresses = addresses.filter(addr => addr.id !== id);
        updateUser({ addresses: updatedAddresses });
    };

    const handleEdit = (addr: any) => {
        setFormData(addr);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            id: '',
            type: 'Home',
            houseNo: '',
            street: '',
            landmark: '',
            city: '',
            state: '',
            pincode: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Saved Addresses</h1>
            </div>

            <div className="max-w-xl mx-auto p-4">
                {/* Address List */}
                <div className="space-y-4 mb-20">
                    {addresses.length === 0 && !showForm ? (
                        <div className="text-center py-12 text-gray-500">
                            <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No addresses saved yet.</p>
                            <p className="text-sm">Add an address to speed up checkout.</p>
                        </div>
                    ) : (
                        addresses.map((addr: any) => (
                            <motion.div
                                key={addr.id}
                                layout
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                                        {addr.type === 'Home' ? <Home size={20} /> : addr.type === 'Work' ? <Briefcase size={20} /> : <MapPin size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">{addr.type}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {addr.houseNo}, {addr.street}<br />
                                            {addr.landmark && <span className='text-gray-500'>{addr.landmark}, </span>}
                                            {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleEdit(addr)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Add Button */}
                {!showForm && (
                    <motion.button
                        layoutId="add-btn"
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="fixed bottom-6 right-6 lg:static lg:w-full lg:mt-6 bg-primary-600 text-white px-6 py-4 rounded-full lg:rounded-xl shadow-lg shadow-primary-600/30 font-bold flex items-center justify-center gap-2 z-20"
                    >
                        <Plus size={24} />
                        <span className="hidden lg:inline">Add New Address</span>
                    </motion.button>
                )}
            </div>

            {/* Address Form Modal/Overlay */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        className="fixed inset-0 bg-white z-50 flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold">{formData.id ? 'Edit Address' : 'Add New Address'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 font-medium">Cancel</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <form className="space-y-4 max-w-xl mx-auto" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>

                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {['Home', 'Work', 'Other'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`py-3 rounded-xl border font-medium text-sm transition ${formData.type === type
                                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">House / Flat No.*</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.houseNo}
                                            onChange={e => setFormData({ ...formData, houseNo: e.target.value })}
                                            className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition outline-none"
                                            placeholder="e.g. Flat 402, Shanti Heights"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Area / Street / Colony*</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.street}
                                            onChange={e => setFormData({ ...formData, street: e.target.value })}
                                            className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition outline-none"
                                            placeholder="e.g. Lanka Road, Near BHU"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.landmark}
                                            onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                                            className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition outline-none"
                                            placeholder="e.g. Opposite Sankat Mochan Temple"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition outline-none"
                                                placeholder="Varanasi"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode*</label>
                                            <input
                                                required
                                                type="text"
                                                maxLength={6}
                                                value={formData.pincode}
                                                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                                className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition outline-none"
                                                placeholder="221005"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-8 bg-primary-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary-600/30 text-lg"
                                >
                                    Save Address
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
