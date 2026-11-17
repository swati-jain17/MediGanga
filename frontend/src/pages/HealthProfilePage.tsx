import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Activity, Heart, AlertCircle, Droplet } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function HealthProfilePage() {
    const navigate = useNavigate();
    const { user, updateHealthProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        bloodGroup: user?.health_profile?.bloodGroup || '',
        height: user?.health_profile?.height || '',
        weight: user?.health_profile?.weight || '',
        allergies: user?.health_profile?.allergies || [],
        conditions: user?.health_profile?.conditions || [],
        medications: user?.health_profile?.medications || []
    });

    const [newAllergy, setNewAllergy] = useState('');
    const [newCondition, setNewCondition] = useState('');

    const handleSave = () => {
        updateHealthProfile(form);
        setIsEditing(false);
    };

    const addAllergy = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAllergy) {
            setForm({ ...form, allergies: [...form.allergies, newAllergy] });
            setNewAllergy('');
        }
    };

    const addCondition = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCondition) {
            setForm({ ...form, conditions: [...form.conditions, newCondition] });
            setNewCondition('');
        }
    };

    const removeItem = (type: 'allergies' | 'conditions', index: number) => {
        const list = [...form[type]];
        list.splice(index, 1);
        setForm({ ...form, [type]: list });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Health Profile</h1>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-primary-600 font-bold px-4 py-2 hover:bg-primary-50 rounded-lg"
                    >
                        Edit
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="bg-primary-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Save size={18} /> Save
                    </button>
                )}
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Vitals */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                            <Activity size={24} />
                        </div>
                        <h2 className="text-lg font-bold">Basic Vitals</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Blood Group</label>
                            {isEditing ? (
                                <select
                                    value={form.bloodGroup}
                                    onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-100"
                                >
                                    <option value="">Select</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-lg font-bold flex items-center gap-2">
                                    <Droplet size={16} className="text-red-500" />
                                    {form.bloodGroup || 'NA'}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Height (cm)</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={form.height}
                                    onChange={e => setForm({ ...form, height: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-100"
                                />
                            ) : (
                                <p className="text-lg font-bold">{form.height || '--'} cm</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mb-1 block">Weight (kg)</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={form.weight}
                                    onChange={e => setForm({ ...form, weight: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary-100"
                                />
                            ) : (
                                <p className="text-lg font-bold">{form.weight || '--'} kg</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Allergies */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                            <AlertCircle size={24} />
                        </div>
                        <h2 className="text-lg font-bold">Allergies</h2>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {form.allergies.map((allergy: string, idx: number) => (
                            <span key={idx} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                {allergy}
                                {isEditing && (
                                    <button onClick={() => removeItem('allergies', idx)} className="hover:text-red-500">×</button>
                                )}
                            </span>
                        ))}
                        {form.allergies.length === 0 && !isEditing && (
                            <p className="text-gray-400 italic">No allergies listed</p>
                        )}
                    </div>

                    {isEditing && (
                        <form onSubmit={addAllergy} className="flex gap-2">
                            <input
                                type="text"
                                value={newAllergy}
                                onChange={e => setNewAllergy(e.target.value)}
                                placeholder="Add allergy (e.g. Peanuts)"
                                className="flex-1 p-3 bg-gray-50 rounded-xl outline-none"
                            />
                            <button type="submit" className="bg-orange-100 text-orange-600 px-4 rounded-xl font-bold">+</button>
                        </form>
                    )}
                </motion.div>

                {/* Conditions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Heart size={24} />
                        </div>
                        <h2 className="text-lg font-bold">Medical Conditions</h2>
                    </div>

                    <div className="space-y-2 mb-4">
                        {form.conditions.map((condition: string, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-blue-50 p-3 rounded-xl">
                                <span className="font-medium text-blue-900">{condition}</span>
                                {isEditing && (
                                    <button onClick={() => removeItem('conditions', idx)} className="text-red-400 hover:text-red-600">Remove</button>
                                )}
                            </div>
                        ))}
                        {form.conditions.length === 0 && !isEditing && (
                            <p className="text-gray-400 italic">No conditions listed</p>
                        )}
                    </div>

                    {isEditing && (
                        <form onSubmit={addCondition} className="flex gap-2">
                            <input
                                type="text"
                                value={newCondition}
                                onChange={e => setNewCondition(e.target.value)}
                                placeholder="Add condition (e.g. Diabetes)"
                                className="flex-1 p-3 bg-gray-50 rounded-xl outline-none"
                            />
                            <button type="submit" className="bg-blue-100 text-blue-600 px-4 rounded-xl font-bold">+</button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
