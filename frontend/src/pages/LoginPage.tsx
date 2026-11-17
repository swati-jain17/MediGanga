
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck, Truck, Pill, Sparkles, Phone } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import medigangaLogoNew from '../assets/images/mediganga-logo-new.png';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (mode === 'register' && name && name.length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = mode === 'register'
                ? await authApi.register(email, password, name || undefined, phone || undefined)
                : await authApi.login(email, password);

            if (response.data.success && response.data.data) {
                // Ensure state is updated BEFORE navigation
                const { token, user } = response.data.data;
                const isNewUser = response.data.data.isNewUser;
                await login(token, user);

                // Small delay to allow state propagation if needed
                setTimeout(() => {
                    navigate(isNewUser ? '/profile' : '/');
                }, 100);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || `Failed to ${mode} `);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Pill className="text-white" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-white">MediGanga</h1>
                    </div>

                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Your Health,<br />
                        Delivered in<br />
                        <span className="text-saffron-300">30-45 Minutes</span>
                    </h2>

                    <p className="text-primary-100 mt-6 text-lg max-w-md">
                        Get medicines delivered faster than ever. Licensed pharmacies, genuine products, doorstep delivery.
                    </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Truck size={20} />
                        </div>
                        <span>30-45 minute delivery in your city</span>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <span>Hospital-grade safety checks</span>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <span>Ayurveda & Modern Medicine</span>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center mb-8">
                        <img
                            src={medigangaLogoNew}
                            alt="MediGanga"
                            className="h-12 w-auto object-contain"
                        />
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                        <button
                            onClick={() => { setMode('login'); setError(''); }}
                            className={`flex - 1 py - 2.5 rounded - lg font - medium transition ${mode === 'login'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                } `}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setMode('register'); setError(''); }}
                            className={`flex - 1 py - 2.5 rounded - lg font - medium transition ${mode === 'register'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                } `}
                        >
                            Register
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                            </h2>
                            <p className="text-gray-500 mb-8">
                                {mode === 'login'
                                    ? 'Enter your credentials to continue'
                                    : 'Sign up to get started'}
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'register' && (
                                    <div className="relative mb-4">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Full Name (optional)"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition text-lg"
                                        />
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Mobile Number"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition text-lg"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email address"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition text-lg"
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition text-lg"
                                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    />
                                </div>

                                {mode === 'login' && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/forgot-password')}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-red-500 text-sm"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || !email || password.length < 6}
                                    className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading
                                        ? '⏳ Please wait...'
                                        : mode === 'login'
                                            ? 'Login'
                                            : 'Create Account'}
                                </button>
                            </form>

                            <p className="text-xs text-gray-400 text-center mt-6">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
