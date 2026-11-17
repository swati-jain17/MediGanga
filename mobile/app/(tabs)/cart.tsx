import { View, Text, FlatList, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/src/store/cartStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CartScreen() {
    const router = useRouter();
    const {
        items,
        subtotal,
        totalSavings,
        requiresPrescription,
        updateQuantity,
        removeItem,
        switchToGeneric,
    } = useCartStore();

    const deliveryFee = 20;
    const total = subtotal() + deliveryFee;

    const handleCheckout = () => {
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart first');
            return;
        }
        router.push('/checkout');
    };

    if (items.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <View style={{ backgroundColor: '#F3F4F6', width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Text style={{ fontSize: 60 }}>🛒</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>Your cart is empty</Text>
                <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 }}>Add medicines to your cart and they'll show up here!</Text>
                <TouchableOpacity
                    style={{ backgroundColor: '#15616D', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 20, shadowColor: '#15616D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 }}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            {/* Header */}
            <LinearGradient
                colors={['#1A7C8F', '#15616D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>My Cart</Text>
                <Text style={{ fontSize: 14, color: '#E0F2FE', marginTop: 4 }}>{items.length} items in your basket</Text>
            </LinearGradient>

            <FlatList
                data={items}
                keyExtractor={(item) => item.medicineId}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                ListFooterComponent={
                    <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 20 }}>Order Summary</Text>

                        <View style={{ gap: 12 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'between', alignItems: 'center' }}>
                                <Text style={{ color: '#6B7280', fontSize: 15 }}>Items Subtotal</Text>
                                <Text style={{ fontWeight: '600', color: '#111827', fontSize: 15 }}>₹{subtotal().toFixed(2)}</Text>
                            </View>

                            {totalSavings() > 0 && (
                                <View style={{ flexDirection: 'row', justifyContent: 'between', alignItems: 'center' }}>
                                    <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '600' }}>Generic Savings</Text>
                                    <Text style={{ fontWeight: '700', color: '#10B981', fontSize: 15 }}>-₹{totalSavings().toFixed(2)}</Text>
                                </View>
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'between', alignItems: 'center' }}>
                                <Text style={{ color: '#6B7280', fontSize: 15 }}>Delivery Partner Fee</Text>
                                <Text style={{ fontWeight: '600', color: '#111827', fontSize: 15 }}>₹{deliveryFee.toFixed(2)}</Text>
                            </View>

                            <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 }} />

                            <View style={{ flexDirection: 'row', justifyContent: 'between', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>Total Payable</Text>
                                <Text style={{ fontSize: 18, fontWeight: '800', color: '#15616D' }}>₹{total.toFixed(2)}</Text>
                            </View>
                        </View>

                        {requiresPrescription() && (
                            <View style={{ backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
                                <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '500', flex: 1 }}>
                                    Some items in your cart require a valid prescription. You will be asked to upload it after checkout.
                                </Text>
                            </View>
                        )}
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderOrigin: '1px solid #F3F4F6' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: 80, height: 80, backgroundColor: '#F9FAFB', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderOrigin: '1px solid #F3F4F6' }}>
                                {item.imageUrl ? (
                                    <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                                ) : (
                                    <Text style={{ fontSize: 32 }}>💊</Text>
                                )}
                            </View>

                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'between' }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1 }} numberOfLines={1}>{item.name}</Text>
                                    <TouchableOpacity onPress={() => removeItem(item.medicineId)}>
                                        <Text style={{ fontSize: 18 }}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }} numberOfLines={1}>{item.manufacturer}</Text>

                                {item.isGeneric ? (
                                    <View style={{ backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' }}>
                                        <Text style={{ fontSize: 11, color: '#065F46', fontWeight: 'bold' }}>GENERIC ALTERNATIVE</Text>
                                    </View>
                                ) : item.genericAlternative ? (
                                    <TouchableOpacity
                                        style={{ backgroundColor: '#F0FDF4', borderRadius: 8, padding: 8, borderOrigin: '1px dashed #10B981' }}
                                        onPress={() => switchToGeneric(item.medicineId)}
                                    >
                                        <Text style={{ fontSize: 11, color: '#16A34A', fontWeight: '700' }}>
                                            💡 Save ₹{item.genericAlternative.savings} with Generic
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'between', alignItems: 'center', marginTop: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 4 }}>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => updateQuantity(item.medicineId, item.quantity - 1)}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4B5563' }}>-</Text>
                                </TouchableOpacity>
                                <Text style={{ width: 30, textAlign: 'center', fontWeight: 'bold', color: '#111827' }}>{item.quantity}</Text>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => updateQuantity(item.medicineId, item.quantity + 1)}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4B5563' }}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    </View>
                )}
            />

            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10 }}>
                <TouchableOpacity
                    style={{ backgroundColor: '#15616D', borderRadius: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                    onPress={handleCheckout}
                >
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Proceed to Checkout</Text>
                    <View style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)', mx: 12, marginHorizontal: 12 }} />
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>₹{total.toFixed(2)}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
