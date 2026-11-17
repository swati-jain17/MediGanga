import { View, Text, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Alert, Image, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, prescriptionsApi } from '@/src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect, useRef } from 'react';
import type { Order } from '@/src/types';

const { width } = Dimensions.get('window');

const statusSteps = [
    { key: 'placed', label: 'Placed', icon: '📝', desc: 'We have received your order' },
    { key: 'verified', label: 'Verified', icon: '✅', desc: 'Pharmacist has verified items' },
    { key: 'preparing', label: 'Packed', icon: '📦', desc: 'Items are securely packed' },
    { key: 'out_for_delivery', label: 'On Way', icon: '🚴', desc: 'Agent is heading to you' },
    { key: 'delivered', label: 'Arrived', icon: '✨', desc: 'Order delivered successfully' },
];

const statusColors: Record<string, string> = {
    placed: '#3B82F6',
    verified: '#8B5CF6',
    preparing: '#F59E0B',
    out_for_delivery: '#F97316',
    delivered: '#10B981',
    cancelled: '#EF4444',
};

export default function OrderTrackingScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();

    const [uploading, setUploading] = useState(false);
    const [timer, setTimer] = useState<number | null>(null);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await ordersApi.getById(id as string);
            return response.data.data as Order;
        },
        enabled: !!id,
        refetchInterval: 10000,
    });

    // Disable Back Navigation if timer is active
    useEffect(() => {
        const onBackPress = () => {
            if (isTimerActive) {
                Alert.alert('Processing', 'Please wait while we verify your prescription.');
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
            if (isTimerActive) {
                e.preventDefault();
                Alert.alert('Processing', 'Please wait while we verify your prescription.');
            }
        });

        return () => {
            subscription.remove();
            unsubscribeBeforeRemove();
        };
    }, [isTimerActive, navigation]);

    // Timer Logic
    useEffect(() => {
        if (isTimerActive && timer === null) {
            setTimer(120); // 2 minutes
        }

        if (isTimerActive && timer !== null && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer((prev) => (prev && prev > 0 ? prev - 1 : 0));
            }, 1000) as any;
        } else if (timer === 0) {
            setIsTimerActive(false);
            setTimer(null);
            // Simulate verification status update
            Alert.alert('Verification Complete', 'Your prescription has been reviewed and approved!');
            router.replace(`/order/${id}`); // Refresh
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerActive, timer]);

    const handleCancelOrder = async () => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        // In real app: await ordersApi.cancel(id);
                        Alert.alert('Cancelled', 'Order has been cancelled.');
                        router.back();
                    }
                }
            ]
        );
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleUploadPrescription = async (useCamera: boolean) => {
        try {
            let result;
            if (useCamera) {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Photo library permission is required to upload photos.');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                });
            }

            if (!result.canceled && result.assets[0]) {
                uploadImage(result.assets[0]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
        setUploading(true);
        const formData = new FormData();

        // @ts-ignore - React Native formData format
        formData.append('file', {
            uri: asset.uri,
            name: 'prescription.jpg',
            type: 'image/jpeg',
        });

        if (id) {
            formData.append('orderId', id as string);
        }

        try {
            await prescriptionsApi.upload(formData);
            setUploading(false);
            setIsTimerActive(true); // Start Timer
        } catch (error) {
            setUploading(false);
            Alert.alert('Upload Failed', 'Could not upload prescription. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <ActivityIndicator size="large" color="#1A7C8F" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'white' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: '#15616D', fontWeight: 'bold' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            {/* Header */}
            <LinearGradient
                colors={['#1A7C8F', '#15616D']}
                style={{ paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                {!isTimerActive && (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                        <Text style={{ color: 'white', fontSize: 16 }}>← Back</Text>
                    </TouchableOpacity>
                )}
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>Track Order</Text>
                <Text style={{ fontSize: 14, color: '#E0F2FE', marginTop: 4 }}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>

                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 20, marginTop: 24, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24 }}>🚀</Text>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Arriving In</Text>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>24 Minutes</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Prescription Upload Section - Only show for placed/pending statuses */}
            {['placed', 'verified'].includes(order.status) && !isTimerActive && (
                <View style={{ margin: 24, marginBottom: 0, backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Prescription Required</Text>
                    <Text style={{ color: '#6B7280', marginBottom: 16 }}>Please upload a photo of your prescription for verification.</Text>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => handleUploadPrescription(true)}
                            style={{ flex: 1, backgroundColor: '#1A7C8F', padding: 12, borderRadius: 12, alignItems: 'center' }}
                            disabled={uploading}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Take Photo 📸</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleUploadPrescription(false)}
                            style={{ flex: 1, backgroundColor: '#E0F2FE', padding: 12, borderRadius: 12, alignItems: 'center' }}
                            disabled={uploading}
                        >
                            <Text style={{ color: '#0369A1', fontWeight: 'bold' }}>Gallery 🖼️</Text>
                        </TouchableOpacity>
                    </View>
                    {uploading && <ActivityIndicator style={{ marginTop: 12 }} color="#1A7C8F" />}
                </View>
            )}

            {/* Timer Active State */}
            {isTimerActive && (
                <View style={{ margin: 24, marginBottom: 0, backgroundColor: '#FFFBEB', borderRadius: 24, padding: 24, borderColor: '#FEF3C7', borderWidth: 2 }}>
                    <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#B45309', marginBottom: 8 }}>Verifying Prescription...</Text>
                    <Text style={{ textAlign: 'center', fontSize: 48, fontWeight: '800', color: '#D97706' }}>
                        {timer !== null ? formatTime(timer) : '2:00'}
                    </Text>
                    <Text style={{ textAlign: 'center', color: '#92400E', marginTop: 8 }}>Please do not close this screen.</Text>
                </View>
            )}

            {/* Progress Timeline */}
            <View style={{ margin: 24, backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 24 }}>Live Tracking</Text>

                {order.status === 'cancelled' ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Text style={{ fontSize: 50, marginBottom: 16 }}>❌</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#EF4444' }}>Order Cancelled</Text>
                    </View>
                ) : (
                    <View>
                        {statusSteps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <View key={step.key} style={{ flexDirection: 'row', marginBottom: index === statusSteps.length - 1 ? 0 : 20 }}>
                                    <View style={{ alignItems: 'center', width: 40, marginRight: 16 }}>
                                        <View style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 18,
                                            backgroundColor: isCompleted ? statusColors[step.key] : '#F3F4F6',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2
                                        }}>
                                            <Text style={{ fontSize: 18 }}>{step.icon}</Text>
                                        </View>
                                        {index < statusSteps.length - 1 && (
                                            <View style={{
                                                width: 2,
                                                height: 40,
                                                backgroundColor: isCompleted ? statusColors[step.key] : '#F3F4F6',
                                                opacity: isCompleted ? 0.5 : 1,
                                                marginTop: 4
                                            }} />
                                        )}
                                    </View>

                                    <View style={{ flex: 1, paddingTop: 4 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: isCompleted ? '#111827' : '#9CA3AF' }}>
                                            {step.label}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: isCompleted ? '#6B7280' : '#D1D5DB', marginTop: 2 }}>
                                            {step.desc}
                                        </Text>
                                    </View>

                                    {isCurrent && (
                                        <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, height: 24 }}>
                                            <Text style={{ fontSize: 10, color: '#1E40AF', fontWeight: 'bold' }}>CURRENT</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>

            {/* Delivery Details Card */}
            <View style={{ marginHorizontal: 24, marginBottom: 24, backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Delivery Address</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 40, height: 40, backgroundColor: '#F0F9FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                        <Text style={{ fontSize: 20 }}>📍</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 20 }}>{order.delivery_address}</Text>
                    </View>
                </View>
            </View>

            {/* Partner Info */}
            <View style={{ marginHorizontal: 24, marginBottom: 24, backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Partner Pharmacy</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 50, height: 50, backgroundColor: '#F0FDF4', borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                        <Text style={{ fontSize: 30 }}>🏥</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#111827' }}>{order.dark_store_name || 'Varanasi Central Pharmacy'}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Order fulfilled by hospital-grade store</Text>
                    </View>
                </View>
            </View>

            {/* Cancel Action */}
            {order.status === 'placed' && (
                <View style={{ marginHorizontal: 24, marginBottom: 40 }}>
                    <TouchableOpacity
                        onPress={handleCancelOrder}
                        style={{ padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', alignItems: 'center' }}
                    >
                        <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>Cancel Order</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}
