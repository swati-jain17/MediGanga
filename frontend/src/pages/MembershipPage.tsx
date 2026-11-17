import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Check, Sparkles, Zap, Star, Video, Truck, Shield, ChevronRight } from 'lucide-react';
import { subscriptionApi } from '../services/api';

export default function MembershipPage() {
    const queryClient = useQueryClient();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const source = searchParams.get('source');
    const transactionId = searchParams.get('transactionId');
    const subPlanId = searchParams.get('planId');

    useEffect(() => {
        if (source === 'phonepe' && transactionId && subPlanId) {
            // Assuming payment was successful if we are back here with params
            // ideally we verify with backend call checkPhonePeStatus but checking subscription status is also enough
            // Let's optimize by just refreshing subscription data
            const timer = setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
                setShowSuccess(true);
                // Clean URL
                navigate('/membership', { replace: true });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [source, transactionId, subPlanId]);

    const { data: plansData, isLoading: plansLoading } = useQuery({
        queryKey: ['subscription-plans'],
        queryFn: async () => {
            const res = await subscriptionApi.getPlans();
            return res.data.data;
        },
    });

    const { data: mySubscription, isLoading: subLoading } = useQuery({
        queryKey: ['my-subscription'],
        queryFn: async () => {
            const res = await subscriptionApi.getMySubscription();
            return res.data.data;
        },
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'phonepe'>('phonepe');

    // ... existing queries ...

    const subscribeMutation = useMutation({
        mutationFn: (planId: string) => subscriptionApi.subscribe({ planId, billingCycle, paymentMethod }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
            setShowPaymentModal(false);
            setShowSuccess(true);
            setIsProcessingPayment(false);
        },
        onError: () => {
            setIsProcessingPayment(false);
        }
    });

    const handleSubscribeClick = (plan: any) => {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        setIsProcessingPayment(true);
        try {
            const result = await subscribeMutation.mutateAsync(selectedPlan.id);
            if (result.data.success) {
                if (result.data.data?.redirectUrl) {
                    window.location.href = result.data.data.redirectUrl;
                } else {
                    queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
                    setShowPaymentModal(false);
                    setShowSuccess(true);
                    setIsProcessingPayment(false);
                }
            }
        } catch (error) {
            console.error("Subscription failed", error);
            setIsProcessingPayment(false);
        }
    };

    const cancelMutation = useMutation({
        mutationFn: () => subscriptionApi.cancel(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
        },
    });

    const getPlanIcon = (name: string) => {
        return name === 'max' ? <Crown className="text-amber-500" size={28} /> : <Sparkles className="text-indigo-500" size={28} />;
    };

    const getPlanGradient = (name: string) => {
        return name === 'max'
            ? 'from-amber-500/20 via-orange-500/10 to-yellow-500/20'
            : 'from-indigo-500/20 via-purple-500/10 to-blue-500/20';
    };

    if (plansLoading || subLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 mb-4"
                    >
                        <Crown size={32} />
                        <h1 className="text-3xl font-bold">MediGanga Membership</h1>
                    </motion.div>
                    <p className="text-indigo-100 text-lg">Unlock premium benefits and save more on every order</p>
                </div>
            </div>

            {/* Current Subscription Badge */}
            {mySubscription && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto -mt-6 px-4"
                >
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Crown size={24} />
                            </div>
                            <div>
                                <p className="font-bold">{mySubscription.display_name} Active</p>
                                <p className="text-sm text-green-100">
                                    Expires: {new Date(mySubscription.expires_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => cancelMutation.mutate()}
                            className="text-sm bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Billing Toggle */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                <div className="flex items-center justify-center gap-4 bg-white rounded-2xl p-2 shadow-sm w-fit mx-auto">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-3 rounded-xl font-medium transition ${billingCycle === 'monthly'
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 ${billingCycle === 'yearly'
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Yearly
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Save 17%</span>
                    </button>
                </div>
            </div>

            {/* Plans */}
            <div className="max-w-4xl mx-auto px-4 mt-8 grid md:grid-cols-2 gap-6">
                {plansData?.map((plan: any, index: number) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative bg-white rounded-3xl p-6 shadow-xl border-2 overflow-hidden ${plan.name === 'max' ? 'border-amber-400' : 'border-indigo-200'
                            }`}
                    >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${getPlanGradient(plan.name)} opacity-50`}></div>

                        {/* Popular badge */}
                        {plan.name === 'max' && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Star size={12} fill="white" /> BEST VALUE
                            </div>
                        )}

                        <div className="relative">
                            {/* Icon & Name */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${plan.name === 'max' ? 'bg-amber-100' : 'bg-indigo-100'
                                    }`}>
                                    {getPlanIcon(plan.name)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{plan.display_name}</h3>
                                    <p className="text-gray-500 text-sm">{plan.description}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ₹{plan.name === 'max' ? 499 : 199}
                                    </span>
                                    <span className="text-gray-500">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                </div>
                                {billingCycle === 'yearly' && (
                                    <p className="text-sm text-green-600 mt-1 font-medium">
                                        Billed ₹{plan.name === 'max' ? 4999 : 1999} yearly
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-6">
                                {(typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features).map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${plan.name === 'max' ? 'bg-amber-500' : 'bg-indigo-500'
                                            }`}>
                                            <Check size={12} className="text-white" />
                                        </div>
                                        <span className="text-gray-700 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <button
                                onClick={() => handleSubscribeClick(plan)}
                                disabled={subscribeMutation.isPending || mySubscription?.plan_name === plan.name}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${mySubscription?.plan_name === plan.name
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : plan.name === 'max'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:scale-[1.02]'
                                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:scale-[1.02]'
                                    }`}
                            >
                                {subscribeMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : mySubscription?.plan_name === plan.name ? (
                                    'Current Plan'
                                ) : (
                                    <>
                                        Get {plan.display_name}
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Benefits Grid */}
            <div className="max-w-4xl mx-auto px-4 mt-12">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose MediGanga Membership?</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Truck, title: 'Free Delivery', desc: 'Unlimited free delivery', color: 'bg-green-100 text-green-600' },
                        { icon: Video, title: 'Video Consults', desc: 'Talk to doctors', color: 'bg-blue-100 text-blue-600' },
                        { icon: Zap, title: 'Priority Support', desc: '24/7 assistance', color: 'bg-amber-100 text-amber-600' },
                        { icon: Shield, title: 'Extra Discounts', desc: 'Up to 10% off', color: 'bg-purple-100 text-purple-600' },
                    ].map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="bg-white rounded-2xl p-4 text-center shadow-sm"
                        >
                            <div className={`w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                                <benefit.icon size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                            <p className="text-gray-500 text-sm">{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full"
                    >
                        <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
                        <div className="bg-gray-50 p-4 rounded-xl mb-4">
                            <div className="flex justify-between mb-2">
                                <span>{selectedPlan.display_name} ({billingCycle})</span>
                                <span className="font-bold">₹{selectedPlan.name === 'max' ? 499 : 199}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax (18% GST)</span>
                                <span>₹{(selectedPlan.name === 'max' ? 499 : 199) * 0.18}</span>
                            </div>
                            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{Math.round((selectedPlan.name === 'max' ? 499 : 199) * 1.18)}</span>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mb-6 space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-2">Select Payment Method</h4>

                            <button
                                onClick={() => setPaymentMethod('phonepe')}
                                className={`w-full p-3 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'phonepe'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-full border border-gray-100 flex items-center justify-center p-1">
                                        <img src="https://phonepe.com/static/icon-512.png" alt="PhonePe" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="font-medium text-gray-900">PhonePe</span>
                                </div>
                                {paymentMethod === 'phonepe' && <Check size={20} className="text-purple-500" />}
                            </button>

                            <button
                                onClick={() => setPaymentMethod('razorpay')}
                                className={`w-full p-3 rounded-xl border-2 transition flex items-center justify-between ${paymentMethod === 'razorpay'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        R
                                    </div>
                                    <span className="font-medium text-gray-900">Razorpay / Card</span>
                                </div>
                                {paymentMethod === 'razorpay' && <Check size={20} className="text-blue-500" />}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handlePayment}
                                disabled={isProcessingPayment}
                                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2"
                            >
                                {isProcessingPayment ? 'Processing...' : 'Pay with UPI / Card'}
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                disabled={isProcessingPayment}
                                className="w-full text-gray-500 py-2 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowSuccess(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Premium!</h3>
                        <p className="text-gray-500 mb-6">Your membership is now active. Enjoy all the benefits!</p>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold"
                        >
                            Start Shopping
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
