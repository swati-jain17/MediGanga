import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { Save, User, Lock, Bell, Shield } from 'lucide-react';

export function SettingsPage() {
    const { user } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);

    const [activeTab, setActiveTab] = useState('profile');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for save logic
        addToast('Settings saved successfully', 'success');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account and application preferences</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[400px]">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 text-sm font-medium ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <User className="h-4 w-4" /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 text-sm font-medium ${activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <Lock className="h-4 w-4" /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 text-sm font-medium ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <Bell className="h-4 w-4" /> Notifications
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-8">
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSave} className="max-w-lg space-y-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" defaultValue={user?.name || ''} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" defaultValue={user?.email || ''} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50" readOnly />
                                <p className="mt-1 text-xs text-gray-500">Email cannot be changed directly.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" defaultValue={user?.phone || ''} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <Save className="h-4 w-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-lg space-y-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <Shield className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            You are logged in as a Super Admin. Please ensure your password is strong.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input type="password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input type="password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                            </div>
                            <div className="pt-4">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="max-w-lg space-y-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="orders" type="checkbox" defaultChecked className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="orders" className="font-medium text-gray-700">New Orders</label>
                                        <p className="text-gray-500">Get notified when a new order is placed.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="prescriptions" type="checkbox" defaultChecked className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="prescriptions" className="font-medium text-gray-700">Prescription Verification</label>
                                        <p className="text-gray-500">Get notified when a prescription needs verification.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input id="inventory" type="checkbox" defaultChecked className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="inventory" className="font-medium text-gray-700">Low Stock Alerts</label>
                                        <p className="text-gray-500">Get notified when medicine stock falls below reorder level.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
