import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Package, FileText, LogOut, Edit2, ChevronRight, Shield, Heart, Crown, Star, Video, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSaveProfile = async () => {
        try {
            await updateProfile({ name, phone, email, profile_picture: profilePicture });
            setIsEditing(false);
        } catch (error) {
            // Toast handled in store
        }
    };

    const menuItems = [
        { icon: Crown, label: 'MediGanga Plus', path: '/membership', description: 'Manage subscription & benefits' },
        { icon: Star, label: 'My Rewards', path: '/rewards', description: 'View points & redeem' },
        { icon: Bell, label: 'Reminders', path: '/reminders', description: 'Medicine & refill alerts' },
        { icon: Package, label: 'My Orders', path: '/orders', description: 'Track and view order history' },
        { icon: Video, label: 'My Consultations', path: '/consultations/my', description: 'Upcoming appointments' },
        { icon: FileText, label: 'Prescriptions', path: '/prescriptions', description: 'Upload and manage prescriptions' },
        { icon: MapPin, label: 'Saved Addresses', path: '/addresses', description: 'Manage delivery addresses' },
        { icon: Heart, label: 'Health Profile', path: '/health-profile', description: 'Allergies, conditions & more' },
        { icon: Shield, label: 'Privacy & Security', path: '/privacy', description: 'Data and account settings' },
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary-500 to-teal-500 rounded-3xl p-6 text-white mb-6"
            >
                <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/30">
                            {profilePicture || user?.profile_picture ? (
                                <img
                                    src={profilePicture || user?.profile_picture}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={40} className="text-white" />
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute bottom-0 right-0 bg-white text-primary-600 p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                <Edit2 size={14} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 500000) {
                                                alert("Image size should be less than 500KB");
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setProfilePicture(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="bg-white/20 text-white placeholder-white/60 px-3 py-2 rounded-lg w-full text-lg font-semibold"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold">{user?.name || 'Set your name'}</h1>
                        )}
                        <p className="text-primary-100 flex items-center gap-1 mt-1">
                            <Phone size={14} />
                            {user?.phone ? `+91 ${user.phone}` : 'Add Phone Number'}
                        </p>
                    </div>
                    <button
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition"
                    >
                        <Edit2 size={20} />
                    </button>
                </div>

                {isEditing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 pt-4 border-t border-white/20"
                    >
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                            <Mail size={18} className="text-white/60" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="bg-transparent text-white placeholder-white/60 flex-1 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 mt-2">
                            <Phone size={18} className="text-white/60" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone number"
                                className="bg-transparent text-white placeholder-white/60 flex-1 outline-none"
                            />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 py-2 bg-white text-primary-600 font-semibold rounded-lg"
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Refer & Earn Banner */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/rewards', { state: { tab: 'referral' } })}
                className="bg-gradient-to-r from-saffron-400 to-saffron-500 rounded-2xl p-4 mb-6 shadow-lg shadow-saffron-500/20 cursor-pointer text-white flex items-center justify-between"
            >
                <div>
                    <h3 className="font-bold text-lg">Refer a Friend</h3>
                    <p className="text-saffron-50 text-sm">Earn 500 MediCoins for every referral!</p>
                </div>
                <div className="bg-white/20 p-2 rounded-xl">
                    <User size={24} />
                </div>
            </motion.div>

            {/* Menu Items */}
            <div className="bg-white rounded-2xl card-shadow overflow-hidden">
                {menuItems.map((item) => (
                    <motion.button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                            <item.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                    </motion.button>
                ))}
            </div>

            {/* Logout */}
            <motion.button
                onClick={handleLogout}
                className="w-full mt-6 p-4 bg-red-50 text-red-600 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition"
                whileTap={{ scale: 0.98 }}
            >
                <LogOut size={20} />
                Logout
            </motion.button>

            {/* App version */}
            <p className="text-center text-gray-400 text-sm mt-6">
                MediGanga v1.0.0 • Made with ❤️ in India
            </p>
        </div>
    );
}
