import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions, Image, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '@/src/store/cartStore';
import { useQuery } from '@tanstack/react-query';
import { medicinesApi } from '@/src/services/api';
import type { Medicine } from '@/src/types';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'pain-relief', name: 'Pain Relief', icon: '💊', colors: ['#FEF2F2', '#FEE2E2'], textColor: '#DC2626' },
  { id: 'diabetes', name: 'Diabetes', icon: '🩸', colors: ['#EFF6FF', '#DBEAFE'], textColor: '#2563EB' },
  { id: 'cardiac', name: 'Heart Health', icon: '❤️', colors: ['#FEF2F2', '#FEE2E2'], textColor: '#DC2626' },
  { id: 'vitamins', name: 'Vitamins', icon: '⚡', colors: ['#FFFBEB', '#FEF3C7'], textColor: '#D97706' },
  { id: 'ayurveda', name: 'Ayurvedic', icon: '🌿', colors: ['#F0FDF4', '#DCFCE7'], textColor: '#16A34A' },
  { id: 'skin', name: 'Skin Care', icon: '✨', colors: ['#FDF2F8', '#FCE7F3'], textColor: '#DB2777' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddedModal, setShowAddedModal] = useState(false);
  const router = useRouter();
  const { addItem, updateQuantity, items, totalItems } = useCartStore();

  const { data: popularMedicines } = useQuery({
    queryKey: ['popular-medicines'],
    queryFn: async () => {
      const response = await medicinesApi.search({ page: 1, limit: 10 });
      return response.data?.data || [];
    }
  });

  const cartItemCount = totalItems();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getQuantity = (medicineId: string) => {
    return items.find(i => i.medicineId === medicineId)?.quantity || 0;
  };

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
    setShowAddedModal(true);
    setTimeout(() => setShowAddedModal(false), 2000);
  };

  const handleUpdateQuantity = (medicineId: string, delta: number) => {
    const currentQty = getQuantity(medicineId);
    updateQuantity(medicineId, currentQty + delta);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#1A7C8F', '#15616D', '#14919B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 60,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        }}
      >
        {/* Live Badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginBottom: 24 }}>
          <View style={{ width: 8, height: 8, backgroundColor: '#FB923C', borderRadius: 4, marginRight: 8 }} />
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>Now Live in Varanasi</Text>
        </View>

        <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold', lineHeight: 42, marginBottom: 8 }}>
          Medicines in{'\n'}
          <Text style={{ color: '#FDBA74' }}>30-45 Minutes</Text>
        </Text>

        <Text style={{ color: '#E0F2FE', fontSize: 16, marginBottom: 24, lineHeight: 24 }}>
          Quick-commerce pharmacy delivering{'\n'}genuine medicines to your doorstep
        </Text>

        {/* Search Bar */}
        <View style={{ backgroundColor: 'white', borderRadius: 16, flexDirection: 'row', overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
          <TextInput
            style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16, fontSize: 16, color: '#111827' }}
            placeholder="Search medicines..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={{ backgroundColor: '#10B981', paddingHorizontal: 24, justifyContent: 'center' }}
            onPress={handleSearch}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Trust Badges */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 24, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginRight: 6 }}>🚚</Text>
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }}>Free delivery ₹1500+</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, marginRight: 6 }}>🛡️</Text>
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }}>100% genuine</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={{ paddingHorizontal: 20, marginTop: -24, marginBottom: 24, flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }}>
          <View style={{ backgroundColor: '#EFF6FF', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 24 }}>⚡</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2563EB' }}>30-45</Text>
          <Text style={{ color: '#4B5563', fontSize: 12, fontWeight: '500' }}>Mins Delivery</Text>
        </View>

        <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }}>
          <View style={{ backgroundColor: '#F0FDF4', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 24 }}>💊</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#10B981' }}>24/7</Text>
          <Text style={{ color: '#4B5563', fontSize: 12, fontWeight: '500' }}>Pharmacist</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827' }}>Shop by Category</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={{ width: '33.33%', paddingHorizontal: 6, marginBottom: 12 }}
              onPress={() => router.push(`/search?category=${encodeURIComponent(cat.name)}`)}
            >
              <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderOrigin: '1px solid #F3F4F6' }}>
                <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: cat.colors[0], alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 28 }}>{cat.icon}</Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: cat.textColor, textAlign: 'center' }}>{cat.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Premium Services */}
      <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Premium Services</Text>

        <LinearGradient
          colors={['#3B82F6', '#2563EB']}
          style={{ borderRadius: 20, padding: 20, marginBottom: 16 }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>🚀 MediGanga Rapid</Text>
          <Text style={{ color: '#DBEAFE', fontSize: 13 }}>Emergency delivery in just 15 minutes</Text>
        </LinearGradient>

        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={{ borderRadius: 20, padding: 20, marginBottom: 16 }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>📸 Prescription Upload</Text>
          <Text style={{ color: '#EDE9FE', fontSize: 13 }}>AI-powered extraction & instant order</Text>
        </LinearGradient>
      </View>

      {/* Popular Medicines */}
      <View style={{ paddingHorizontal: 24, marginBottom: 100 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>Popular Medicines</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
          {popularMedicines?.map((med: Medicine) => {
            const qty = getQuantity(med.id);

            return (
              <TouchableOpacity
                key={med.id}
                onPress={() => router.push(`/medicine/${med.id}`)}
                activeOpacity={0.9}
                style={{ width: 160, marginRight: 16, backgroundColor: 'white', borderRadius: 20, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
              >
                <View style={{ height: 100, backgroundColor: '#F3F4F6', borderRadius: 16, marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
                  {med.image_url ? (
                    <Image source={{ uri: med.image_url }} style={{ width: '100%', height: '100%', borderRadius: 16 }} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 40 }}>💊</Text>
                  )}
                </View>

                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 4 }} numberOfLines={1}>{med.name}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }} numberOfLines={1}>{med.manufacturer}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifySelf: 'flex-end', marginTop: 'auto' }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#15616D', flex: 1 }}>₹{med.mrp}</Text>

                  {qty > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', borderRadius: 8, padding: 4 }}>
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleUpdateQuantity(med.id, -1); }} style={{ width: 24, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0369A1' }}>-</Text>
                      </TouchableOpacity>
                      <Text style={{ marginHorizontal: 4, fontWeight: 'bold', minWidth: 16, textAlign: 'center' }}>{qty}</Text>
                      <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleUpdateQuantity(med.id, 1); }} style={{ width: 24, alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0369A1' }}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); handleAddToCart(med); }}
                      style={{ backgroundColor: '#15616D', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>ADD</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          onPress={() => router.push('/cart')}
          style={{
            position: 'absolute',
            bottom: 30,
            right: 24,
            backgroundColor: '#15616D',
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 999,
            shadowColor: '#15616D',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View style={{ backgroundColor: 'white', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Text style={{ color: '#15616D', fontWeight: 'bold', fontSize: 14 }}>{cartItemCount}</Text>
          </View>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>View Cart</Text>
        </TouchableOpacity>
      )}

      {/* Added to Cart Popup */}
      <Modal
        visible={showAddedModal}
        transparent
        animationType="fade"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5, minWidth: 200 }}>
            <View style={{ width: 60, height: 60, backgroundColor: '#F0FDF4', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 32 }}>✅</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>Added to Cart</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
