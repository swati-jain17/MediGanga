import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '@/src/services/api';
import { useCartStore } from '@/src/store/cartStore';
import { LinearGradient } from 'expo-linear-gradient';
import type { Medicine } from '@/src/types';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(params.q as string || '');
    const [category, setCategory] = useState(params.category as string || '');
    const { addItem } = useCartStore();

    const { data, isLoading } = useQuery({
        queryKey: ['search', searchQuery, category],
        queryFn: async () => {
            if (!searchQuery && !category) return { data: [], pagination: {} };
            const response = await medicinesApi.search({
                query: searchQuery,
                category: category,
                page: 1,
                limit: 20,
            });
            return response.data;
        },
        enabled: !!(searchQuery || category),
    });

    const handleAddToCart = async (medicine: Medicine) => {
        await addItem({
            medicineId: medicine.id,
            name: medicine.name,
            quantity: 1,
            price: medicine.mrp,
            originalPrice: medicine.mrp,
            isGeneric: false,
            scheduleType: medicine.schedule_type,
            manufacturer: medicine.manufacturer,
            imageUrl: medicine.image_url,
        });
        Alert.alert('Success', `${medicine.name} added to cart!`);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            {/* Premium Search Header */}
            <LinearGradient
                colors={['#1A7C8F', '#15616D']}
                style={{ paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                <View style={{ backgroundColor: 'white', borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
                    <TextInput
                        style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 14, fontSize: 16, color: '#111827' }}
                        placeholder="Search for medicines..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                    <View style={{ paddingRight: 16 }}>
                        <Text style={{ fontSize: 20 }}>🔍</Text>
                    </View>
                </View>
                {category ? (
                    <View style={{ flexDirection: 'row', marginTop: 12 }}>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Category: {category}</Text>
                            <TouchableOpacity onPress={() => setCategory('')} style={{ marginLeft: 8 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}
            </LinearGradient>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#1A7C8F" />
                </View>
            ) : !data?.data || data.data.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Text style={{ fontSize: 80, marginBottom: 16 }}>🔎</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>No medicines found</Text>
                    <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>Try searching with a different name or browse categories.</Text>
                </View>
            ) : (
                <FlatList
                    data={data.data}
                    keyExtractor={(item: Medicine) => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }: { item: Medicine }) => (
                        <TouchableOpacity
                            style={{ backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderOrigin: '1px solid #F3F4F6' }}
                            onPress={() => router.push(`/medicine/${item.id}`)}
                            activeOpacity={0.8}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: 80, height: 80, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderOrigin: '1px solid #F3F4F6' }}>
                                    {item.image_url ? (
                                        <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                                    ) : (
                                        <Text style={{ fontSize: 32 }}>💊</Text>
                                    )}
                                </View>

                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'between' }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', flex: 1 }} numberOfLines={1}>{item.name}</Text>
                                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#15616D' }}>₹{item.mrp.toFixed(2)}</Text>
                                    </View>
                                    <Text style={{ fontSize: 13, color: '#6B7280', marginVertical: 4 }} numberOfLines={1}>{item.manufacturer}</Text>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        {item.schedule_type !== 'OTC' ? (
                                            <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 }}>
                                                <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: 'bold' }}>Rx REQUIRED</Text>
                                            </View>
                                        ) : (
                                            <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 }}>
                                                <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: 'bold' }}>OTC</Text>
                                            </View>
                                        )}
                                        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>• Delivery in 30m</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={{ backgroundColor: '#15616D', paddingVertical: 12, borderRadius: 16, marginTop: 16, alignItems: 'center' }}
                                onPress={() => handleAddToCart(item)}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>Add to Cart</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}
import { Alert } from 'react-native';
