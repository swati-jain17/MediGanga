import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Smartphone, Eye, EyeOff, ShieldCheck } from 'lucide-react';
// import { useAuthStore } from '../store/authStore';

export function PrivacyPage() {
    const navigate = useNavigate();
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Change Password State
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Password updated successfully!');
        setCurrentPass('');
        setNewPass('');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Privacy & Security</h1>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">

                {/* Security Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-green-500" />
                        Account Security
                    </h2>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Biometric Login</p>
                                <p className="text-xs text-gray-500">FaceID / Fingerprint</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setBiometricEnabled(!biometricEnabled)}
                            className={`w-12 h-7 rounded-full transition relative ${biometricEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${biometricEnabled ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                                <Lock size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Two-Factor Auth</p>
                                <p className="text-xs text-gray-500">Coming soon</p>
                            </div>
                        </div>
                        <button disabled className="w-12 h-7 bg-gray-200 rounded-full relative">
                            <div className="w-5 h-5 bg-white rounded-full absolute top-1 left-1" />
                        </button>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Current Password</label>
                            <input
                                type="password"
                                value={currentPass}
                                onChange={e => setCurrentPass(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-primary-500 transition outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-primary-500 transition outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!currentPass || !newPass}
                            className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update Password
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <button className="text-red-500 font-medium text-sm hover:underline">
                        Delete Account Permanently
                    </button>
                </div>
            </div>
        </div>
    );
}
