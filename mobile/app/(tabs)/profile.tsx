import { View, Text, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    const menuItems = [
        {
            title: 'Account Settings',
            items: [
                { id: 'edit', icon: '👤', label: 'Edit Profile', sub: 'Update personal info' },
                { id: 'health', icon: '🏥', label: 'Health Profile', sub: 'Allergies & conditions' },
                { id: 'addresses', icon: '📍', label: 'Saved Addresses', sub: 'Manage delivery spots' },
            ]
        },
        {
            title: 'Earn & Track',
            items: [
                { id: 'points', icon: '🎁', label: 'GangaPoints', sub: 'View rewards & loyalty' },
                { id: 'inventory', icon: '💊', label: 'Digital Inventory', sub: 'Track your home stock' },
                { id: 'prescriptions', icon: '📄', label: 'My Prescriptions', sub: 'View uploaded files' },
                { id: 'membership', icon: '👑', label: 'My Membership', sub: 'Upgrade to MediGanga Plus' },
            ]
        },
        {
            title: 'Support',
            items: [
                { id: 'help', icon: '❓', label: 'Help & Support', sub: 'Get help with orders' },
                { id: 'about', icon: '📱', label: 'About MediGanga', sub: 'App info & version' },
            ]
        }
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            {/* Profile Header */}
            <LinearGradient
                colors={['#1A7C8F', '#15616D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                <View className="flex-row items-center">
                    <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
                        <Text className="text-4xl">👨‍⚕️</Text>
                    </View>
                    <View className="ml-5 flex-1">
                        <Text className="text-white text-3xl font-bold">{user?.name || 'Guest User'}</Text>
                        <Text className="text-blue-100 text-base">{user?.email || 'user@example.com'}</Text>
                        <View className="bg-orange-500/80 self-start px-3 py-1 rounded-full mt-2">
                            <Text className="text-white text-xs font-bold">PRO MEMBER</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Menu Sections */}
            <View style={{ padding: 24 }}>
                {menuItems.map((section, idx) => (
                    <View key={idx} style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>
                            {section.title}
                        </Text>
                        <View style={{ backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' }}>
                            {section.items.map((item, i) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 16,
                                        borderBottomWidth: i === section.items.length - 1 ? 0 : 1,
                                        borderBottomColor: '#F3F4F6'
                                    }}
                                    activeOpacity={0.6}
                                    onPress={() => item.id === 'membership' ? router.push('/membership') : null}
                                >
                                    <View style={{ width: 44, height: 44, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>{item.label}</Text>
                                        <Text style={{ fontSize: 13, color: '#6B7280' }}>{item.sub}</Text>
                                    </View>
                                    <Text style={{ fontSize: 20, color: '#D1D5DB' }}>›</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#FEF2F2',
                        padding: 20,
                        borderRadius: 24,
                        borderWidth: 1,
                        borderColor: '#FEE2E2',
                        marginTop: 8,
                        marginBottom: 40
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={{ fontSize: 18, marginRight: 10 }}>🚪</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444' }}>Logout of Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
