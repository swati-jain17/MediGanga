import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ordersApi } from '@/src/services/api';
import type { Order } from '@/src/types';

const statusColors: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-700',
    verified: 'bg-purple-100 text-purple-700',
    preparing: 'bg-yellow-100 text-yellow-700',
    out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
    placed: 'Placed',
    verified: 'Verified',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

export default function OrdersScreen() {
    const router = useRouter();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await ordersApi.getAll();
            return (response.data.data || []) as Order[];
        },
    });

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0284c7" />
            </View>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-6">
                <Text className="text-6xl mb-4">📦</Text>
                <Text className="text-xl font-bold text-gray-900 mb-2">No orders yet</Text>
                <Text className="text-gray-600 text-center">Your orders will appear here once you make a purchase</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
                <Text className="text-2xl font-bold text-gray-900">My Orders</Text>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                contentContainerClassName="p-4"
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
                        onPress={() => router.push(`/order/${item.id}`)}
                    >
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-gray-900">
                                    Order #{item.id.slice(0, 8)}
                                </Text>
                                <Text className="text-sm text-gray-500 mt-1">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full ${statusColors[item.status]}`}>
                                <Text className="text-xs font-semibold">{statusLabels[item.status]}</Text>
                            </View>
                        </View>

                        <View className="border-t border-gray-100 pt-3">
                            <Text className="text-sm text-gray-600 mb-2">
                                {item.items.length} item{item.items.length > 1 ? 's' : ''}
                            </Text>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-base font-bold text-gray-900">
                                    ₹{item.total_amount.toFixed(2)}
                                </Text>
                                {item.generic_savings > 0 && (
                                    <Text className="text-sm text-green-600">
                                        Saved ₹{item.generic_savings.toFixed(2)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
