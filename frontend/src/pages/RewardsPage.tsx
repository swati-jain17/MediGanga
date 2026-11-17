import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Star, Flame, Trophy, ArrowRight, Coins, History, Users, Copy, Share2 } from 'lucide-react';
import { loyaltyApi } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';

export default function RewardsPage() {
    const queryClient = useQueryClient();
    const location = useLocation();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'earn' | 'redeem' | 'history' | 'referral'>('earn');

    // Generate referral code from user ID or fallback
    const referralCode = user?.id ? `MEDI-${user.id.substring(0, 6).toUpperCase()}` : 'MEDI-USER';
    const { addToast } = useToastStore();

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        addToast('Referral code copied!', 'success');
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Join MediGanga',
                    text: `Use my code ${referralCode} to get ₹100 off your first medicine order!`,
                    url: window.location.origin
                });
            } else {
                handleCopyCode();
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const { data: balanceData, isLoading } = useQuery({
        queryKey: ['loyalty-balance'],
        queryFn: async () => {
            const res = await loyaltyApi.getBalance();
            return res.data.data;
        },
    });

    const { data: rewardsData } = useQuery({
        queryKey: ['loyalty-rewards'],
        queryFn: async () => {
            const res = await loyaltyApi.getRewards();
            return res.data.data;
        },
    });

    const redeemMutation = useMutation({
        mutationFn: (points: number) => loyaltyApi.redeem(points),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-balance'] });
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const balance = balanceData?.balance || 0;
    const streak = balanceData?.streak || { current_streak: 0, longest_streak: 0 };
    const rewards = balanceData?.rewards || { nextRewardAt: 50, pointsToNextReward: 50 };
    const progressPercent = Math.min(100, ((rewards.nextRewardAt - rewards.pointsToNextReward) / rewards.nextRewardAt) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/30 pb-24">
            {/* Header with Points */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white pt-8 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Coins size={28} className="text-yellow-200" />
                            <h1 className="text-xl font-medium">GangaPoints</h1>
                        </div>
                        <div className="text-6xl font-bold mb-2">{balance.toLocaleString()}</div>
                        <p className="text-amber-100">Total earned: {balanceData?.totalEarned?.toLocaleString() || 0} points</p>
                    </motion.div>
                </div>
            </div>

            {/* Progress Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto -mt-10 px-4"
            >
                <div className="bg-white rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                                <Gift size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Next Reward</h3>
                                <p className="text-gray-500 text-sm">₹{rewards.nextRewardAt} voucher</p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-amber-500">{rewards.pointsToNextReward} pts left</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-4 bg-amber-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Streak Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-4xl mx-auto mt-4 px-4"
            >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Flame size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{streak.current_streak} Day Streak!</h3>
                                <p className="text-orange-100">Keep taking your medicines on time</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-orange-100">Best streak</div>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                <Trophy size={20} className="text-yellow-300" />
                                {streak.longest_streak}
                            </div>
                        </div>
                    </div>
                    <Link
                        to="/reminders"
                        className="mt-4 w-full bg-white/20 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/30 transition"
                    >
                        Set Medicine Reminders <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto mt-8 px-4">
                <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm">
                    {[
                        { id: 'earn', label: 'How to Earn', icon: Star },
                        { id: 'redeem', label: 'Redeem', icon: Gift },
                        { id: 'referral', label: 'Refer & Earn', icon: Users },
                        { id: 'history', label: 'History', icon: History },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition ${activeTab === tab.id
                                ? 'bg-amber-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-4xl mx-auto mt-6 px-4">
                {activeTab === 'earn' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {[
                            { title: 'Shop & Earn', desc: 'Earn 1 point for every ₹100 spent', points: '1 pt/₹100', icon: '🛒' },
                            { title: 'Medicine Adherence', desc: 'Mark "Taken" in reminders daily', points: '5 pts/day', icon: '💊' },
                            { title: '7-Day Streak Bonus', desc: 'Complete 7 consecutive days', points: '25 pts', icon: '🔥' },
                            { title: 'Refer a Friend', desc: 'When they make first order', points: '50 pts', icon: '👥' },
                            { title: 'Birthday Bonus', desc: 'Special bonus on your birthday', points: '100 pts', icon: '🎂' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                    <p className="text-gray-500 text-sm">{item.desc}</p>
                                </div>
                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                                    +{item.points}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'redeem' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {rewardsData?.map((reward: any, i: number) => (
                            <div
                                key={i}
                                className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${balance >= reward.points ? 'border-transparent' : 'border-dashed border-gray-200 opacity-60'
                                    }`}
                            >
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold text-lg">₹{reward.value}</span>
                                    </div>
                                    <h4 className="font-bold text-gray-900">{reward.description}</h4>
                                    <p className="text-amber-600 text-sm font-medium">{reward.points} points</p>
                                </div>
                                <button
                                    onClick={() => redeemMutation.mutate(reward.points)}
                                    disabled={balance < reward.points || redeemMutation.isPending}
                                    className={`w-full py-3 rounded-xl font-medium transition ${balance >= reward.points
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {balance >= reward.points ? 'Redeem Now' : `Need ${reward.points - balance} more`}
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        {balanceData?.transactions?.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl">
                                <History size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No transactions yet</p>
                            </div>
                        ) : (
                            balanceData?.transactions?.map((tx: any, i: number) => (
                                <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'earned' || tx.type === 'bonus'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-red-100 text-red-600'
                                            }`}>
                                            {tx.type === 'earned' || tx.type === 'bonus' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{tx.description}</p>
                                            <p className="text-gray-500 text-sm">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'earned' || tx.type === 'bonus'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                        }`}>
                                        {tx.type === 'earned' || tx.type === 'bonus' ? '+' : ''}{tx.points} pts
                                    </span>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {activeTab === 'referral' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-3xl p-6 shadow-sm text-center"
                    >
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={40} className="text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite Friends, Get Rewards</h2>
                        <p className="text-gray-500 mb-8">
                            Share your code with friends. They get ₹100 off their first order, and you get 50 MediGame Points!
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between border border-gray-200 border-dashed">
                            <div className="text-left">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Your Referral Code</p>
                                <p className="text-xl font-mono font-bold text-gray-900 tracking-widest">{referralCode}</p>
                            </div>
                            <button
                                onClick={handleCopyCode}
                                className="p-2 hover:bg-white rounded-lg transition"
                            >
                                <Copy size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <button
                            onClick={handleShare}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition transform active:scale-95"
                        >
                            <Share2 size={20} />
                            Share with Friends
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
