import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '@/src/services/api';
import { useAuthStore } from '@/src/store/authStore';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuthStore();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.register(email, password, name);
            if (response.data.success && response.data.data) {
                const { token, user } = response.data.data;
                await login(token, user);
                // Ensure state is set before navigating
                setTimeout(() => {
                    router.replace('/(tabs)');
                }, 100);
            }
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
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
                <ScrollView contentContainerClassName="py-12 px-6">
                    <View className="mb-10">
                        <View className="bg-white/20 w-20 h-20 rounded-3xl items-center justify-center mb-6">
                            <Text className="text-5xl">✨</Text>
                        </View>
                        <Text className="text-white text-5xl font-bold mb-3">Join Us</Text>
                        <Text className="text-blue-100 text-lg">Create your MediGanga account</Text>
                    </View>

                    <View className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                        <View className="mb-4">
                            <Text className="text-white/80 text-sm font-medium mb-1">Full Name</Text>
                            <TextInput
                                className="bg-white/20 border border-white/30 rounded-xl px-4 py-4 text-base text-white"
                                placeholder="Enter your full name"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={name}
                                onChangeText={setName}
                                editable={!isLoading}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-white/80 text-sm font-medium mb-1">Email</Text>
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

                        <View className="mb-4">
                            <Text className="text-white/80 text-sm font-medium mb-1">Password</Text>
                            <TextInput
                                className="bg-white/20 border border-white/30 rounded-xl px-4 py-4 text-base text-white"
                                placeholder="Create a password"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!isLoading}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-white/80 text-sm font-medium mb-1">Confirm Password</Text>
                            <TextInput
                                className="bg-white/20 border border-white/30 rounded-xl px-4 py-4 text-base text-white"
                                placeholder="Confirm password"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                editable={!isLoading}
                            />
                        </View>

                        <TouchableOpacity
                            className="rounded-xl py-4 shadow-xl active:opacity-80"
                            style={{ backgroundColor: isLoading ? '#FFA06A' : '#FF9933' }}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            <Text className="text-white text-center text-base font-bold">
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="py-4 mt-2"
                            onPress={() => router.back()}
                            disabled={isLoading}
                        >
                            <Text className="text-white text-center text-base">
                                Already have an account? <Text className="font-bold text-orange-300">Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}
