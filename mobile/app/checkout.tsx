import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Modal, BackHandler } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useNavigation } from 'expo-router';
import { useCartStore } from '@/src/store/cartStore';
import { ordersApi } from '@/src/services/api';

export default function CheckoutScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const {
        items,
        subtotal,
        totalSavings,
        requiresPrescription,
        hasBlockingInteractions,
        hasMajorInteractions,
        clearCart
    } = useCartStore();

    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

    const deliveryFee = 20;
    const total = subtotal() + deliveryFee;

    // Disable back navigation during processing or when success modal is shown
    useEffect(() => {
        const onBackPress = () => {
            if (isProcessing || showSuccessModal) {
                return true; // Disable back button
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        // Also prevent gesture navigation
        const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
            if (isProcessing || showSuccessModal) {
                e.preventDefault();
            }
        });

        return () => {
            subscription.remove();
            unsubscribeBeforeRemove();
        };
    }, [isProcessing, showSuccessModal, navigation]);

    const handlePlaceOrder = async () => {
        if (!address || !phone) {
            Alert.alert('Error', 'Please fill in all delivery details');
            return;
        }

        if (hasBlockingInteractions()) {
            Alert.alert('Drug Interaction Alert', 'Your cart contains medicines with contraindications. Please review your cart.');
            return;
        }

        if (requiresPrescription()) {
            Alert.alert(
                'Prescription Required',
                'Some items require a prescription. You will need to upload it after placing the order.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue', onPress: () => processOrder() }
                ]
            );
            return;
        }

        await processOrder();
    };

    const processOrder = async () => {
        setIsProcessing(true);

        try {
            const response = await ordersApi.create({
                items: items.map(item => ({
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    price: item.price,
                    isGeneric: item.isGeneric,
                })),
                deliveryAddress: address,
                deliveryLocation: {
                    latitude: 25.3176, // Default Varanasi coordinates
                    longitude: 82.9739,
                },
                acknowledgedInteractions: hasMajorInteractions(),
            });

            if (response.data.success && response.data.data) {
                await clearCart();
                setCreatedOrderId(response.data.data.id);
                setShowSuccessModal(true);
            }
        } catch (error: any) {
            Alert.alert('Order Failed', error.response?.data?.message || 'Something went wrong');
            setIsProcessing(false);
        }
    };

    const handleSuccessContinue = () => {
        setShowSuccessModal(false);
        if (createdOrderId) {
            router.replace(`/order/${createdOrderId}`);
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                {/* Delivery Details */}
                <View className="bg-white rounded-xl p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Delivery Details</Text>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                            placeholder="Enter phone number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            editable={!isProcessing}
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Delivery Address</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                            placeholder="Enter full address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                            editable={!isProcessing}
                        />
                    </View>
                </View>

                {/* Order Summary */}
                <View className="bg-white rounded-xl p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Order Summary</Text>

                    <View className="space-y-2">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{items.length} item{items.length > 1 ? 's' : ''}</Text>
                            <Text className="font-semibold">₹{subtotal().toFixed(2)}</Text>
                        </View>

                        {totalSavings() > 0 && (
                            <View className="flex-row justify-between">
                                <Text className="text-green-600">Generic Savings</Text>
                                <Text className="font-semibold text-green-600">-₹{totalSavings().toFixed(2)}</Text>
                            </View>
                        )}

                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Delivery Fee</Text>
                            <Text className="font-semibold">₹{deliveryFee.toFixed(2)}</Text>
                        </View>

                        <View className="border-t border-gray-200 pt-2 mt-2">
                            <View className="flex-row justify-between">
                                <Text className="text-lg font-bold">Total</Text>
                                <Text className="text-lg font-bold text-primary-600">₹{total.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Warnings */}
                {requiresPrescription() && (
                    <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <Text className="text-sm text-yellow-800">
                            ⚠️ Prescription required for some items
                        </Text>
                    </View>
                )}

                {hasMajorInteractions() && (
                    <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <Text className="text-sm text-orange-800">
                            ⚠️ Your cart contains medicines with possible interactions
                        </Text>
                    </View>
                )}

                {/* Place Order Button */}
                <TouchableOpacity
                    className={`py-4 rounded-xl ${isProcessing ? 'bg-primary-300' : 'bg-primary-600'}`}
                    onPress={handlePlaceOrder}
                    disabled={isProcessing}
                >
                    <Text className="text-white text-center text-base font-bold">
                        {isProcessing ? 'Processing...' : `Place Order • ₹${total.toFixed(2)}`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Order Placed Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="slide"
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
                            <Text className="text-4xl">🎉</Text>
                        </View>

                        <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</Text>
                        <Text className="text-center text-gray-600 mb-8">
                            Your order has been successfully placed. {requiresPrescription() ? 'Please upload your prescription next.' : 'Verification will begin shortly.'}
                        </Text>

                        <TouchableOpacity
                            className="bg-primary-600 w-full py-4 rounded-xl"
                            onPress={handleSuccessContinue}
                        >
                            <Text className="text-white text-center font-bold text-lg">Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
