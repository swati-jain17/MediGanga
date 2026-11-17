import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.login(email, password);
            if (response.data.success && response.data.data) {
                const { token, user } = response.data.data;
                await login(token, user);
                // Ensure state is set before navigating
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 100);
            }
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            <LinearGradient
                colors={['#1A7C8F', '#15616D']}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="flex-1 justify-center px-6">
                    <View className="mb-12">
                        <View className="bg-white/20 w-20 h-20 rounded-3xl items-center justify-center mb-6">
                            <Text className="text-5xl">💊</Text>
                        </View>
                        <Text className="text-white text-5xl font-bold mb-3">Welcome{'\n'}Back</Text>
                        <Text className="text-blue-100 text-lg">Sign in to continue to MediGanga</Text>
                    </View>

                    <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                        <View className="mb-5">
                            <Text className="text-white/80 text-sm font-medium mb-2">Email Address</Text>
                            <TextInput
                                className="bg-white/20 border border-white/30 rounded-xl px-4 py-4 text-base text-white"
                                placeholder="Enter your email"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-white/80 text-sm font-medium mb-2">Password</Text>
                            <TextInput
                                className="bg-white/20 border border-white/30 rounded-xl px-4 py-4 text-base text-white"
                                placeholder="Enter your password"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!isLoading}
                            />
                        </View>

                        <TouchableOpacity
                            className="rounded-xl py-4 shadow-xl active:opacity-80"
                            style={{ backgroundColor: isLoading ? '#FFA06A' : '#FF9933' }}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text className="text-white text-center text-base font-bold">
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="py-4 mt-4"
                            onPress={() => router.push('/register')}
                            disabled={isLoading}
                        >
                            <Text className="text-white text-center text-base">
                                Don't have an account? <Text className="font-bold text-orange-300">Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-8 flex-row items-center justify-center">
                        <View className="flex-row items-center">
                            <Text className="text-white/60 text-sm mr-2">🛡️</Text>
                            <Text className="text-white/60 text-sm">Secure Login</Text>
                        </View>
                        <Text className="text-white/40 mx-3">•</Text>
                        <View className="flex-row items-center">
                            <Text className="text-white/60 text-sm mr-2">🔒</Text>
                            <Text className="text-white/60 text-sm">Encrypted</Text>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
