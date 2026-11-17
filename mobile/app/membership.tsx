import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { subscriptionApi } from '@/src/services/api'; // Assuming same API structure

export default function MembershipScreen() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock Plans Data
    const plans = [
        {
            id: 'plus',
            name: 'MediGanga Plus',
            price_monthly: 199,
            price_yearly: 1999,
            color: ['#6366f1', '#a855f7'],
            icon: '✨',
            features: ['Free Delivery', '5% Discount on Medicines', 'Priority Support']
        },
        {
            id: 'max',
            name: 'MediGanga Max',
            price_monthly: 499,
            price_yearly: 4999,
            color: ['#f59e0b', '#ea580c'],
            icon: '👑',
            features: ['Free Delivery', '10% Discount', 'Video Consultations', 'Family Health Tracking']
        }
    ];

    const handleSubscribe = (planId: string) => {
        setSelectedPlan(planId);
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        setIsProcessing(true);
        // Simulate payment delay
        setTimeout(() => {
            setIsProcessing(false);
            setShowPaymentModal(false);
            Alert.alert('Success', 'Welcome to Premium! Your membership is active.');
            router.back();
        }, 1500);
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                className="pt-16 pb-10 px-6 rounded-b-3xl"
            >
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-white text-lg">← Back</Text>
                </TouchableOpacity>
                <View className="flex-row items-center mb-2">
                    <Text className="text-4xl mr-3">👑</Text>
                    <Text className="text-white text-3xl font-bold">Premium</Text>
                </View>
                <Text className="text-indigo-100 text-lg">Upgrade for exclusive benefits</Text>
            </LinearGradient>

            {/* Billing Toggle */}
            <View className="flex-row bg-white mx-6 -mt-6 p-1 rounded-xl shadow-sm">
                <TouchableOpacity
                    onPress={() => setBillingCycle('monthly')}
                    className={`flex-1 py-3 rounded-lg items-center ${billingCycle === 'monthly' ? 'bg-indigo-100' : 'bg-transparent'}`}
                >
                    <Text className={`font-bold ${billingCycle === 'monthly' ? 'text-indigo-700' : 'text-gray-500'}`}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setBillingCycle('yearly')}
                    className={`flex-1 py-3 rounded-lg items-center ${billingCycle === 'yearly' ? 'bg-indigo-100' : 'bg-transparent'}`}
                >
                    <Text className={`font-bold ${billingCycle === 'yearly' ? 'text-indigo-700' : 'text-gray-500'}`}>Yearly (Save 17%)</Text>
                </TouchableOpacity>
            </View>

            {/* Plans List */}
            <View className="p-6">
                {plans.map((plan) => (
                    <TouchableOpacity
                        key={plan.id}
                        onPress={() => handleSubscribe(plan.id)}
                        activeOpacity={0.9}
                        className="bg-white mb-6 rounded-3xl overflow-hidden shadow-md border-2 border-transparent"
                    >
                        <LinearGradient
                            colors={plan.color as [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-6"
                        >
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                                        <Text className="text-2xl">{plan.icon}</Text>
                                    </View>
                                    <Text className="text-white text-2xl font-bold">{plan.name}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-white text-3xl font-bold">
                                        ₹{billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly}
                                    </Text>
                                    <Text className="text-white/80">
                                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-6 bg-black/10 rounded-xl p-4">
                                {plan.features.map((feature, idx) => (
                                    <View key={idx} className="flex-row items-center mb-2 last:mb-0">
                                        <Text className="text-white mr-2">✓</Text>
                                        <Text className="text-white font-medium">{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            <View className="mt-6 bg-white py-3 rounded-xl items-center">
                                <Text style={{ color: plan.color[1] }} className="font-bold text-lg">
                                    Choose {plan.name}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Payment Modal */}
            <Modal
                transparent
                visible={showPaymentModal}
                animationType="fade"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white rounded-3xl p-6">
                        <Text className="text-2xl font-bold mb-4 text-center">Complete Payment</Text>

                        <View className="bg-gray-50 p-4 rounded-xl mb-6">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600">Plan Total</Text>
                                <Text className="font-bold">
                                    ₹{selectedPlan ? (billingCycle === 'monthly' ? plans.find(p => p.id === selectedPlan)?.price_monthly : plans.find(p => p.id === selectedPlan)?.price_yearly) : 0}
                                </Text>
                            </View>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600">Tax (18%)</Text>
                                <Text className="font-bold text-gray-500">
                                    ₹{Math.round((selectedPlan ? (billingCycle === 'monthly' ? plans.find(p => p.id === selectedPlan)?.price_monthly || 0 : plans.find(p => p.id === selectedPlan)?.price_yearly || 0) : 0) * 0.18)}
                                </Text>
                            </View>
                            <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
                                <Text className="text-lg font-bold">Total Payable</Text>
                                <Text className="text-lg font-bold text-indigo-600">
                                    ₹{Math.round((selectedPlan ? (billingCycle === 'monthly' ? plans.find(p => p.id === selectedPlan)?.price_monthly || 0 : plans.find(p => p.id === selectedPlan)?.price_yearly || 0) : 0) * 1.18)}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={confirmPayment}
                            disabled={isProcessing}
                            className="bg-indigo-600 py-4 rounded-xl items-center mb-3 shadow-lg"
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Pay Securely</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowPaymentModal(false)}
                            disabled={isProcessing}
                            className="py-3 items-center"
                        >
                            <Text className="text-gray-500 font-medium">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
