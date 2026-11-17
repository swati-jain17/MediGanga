import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';
import type { User, HealthProfile } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    updateHealthProfile: (profile: HealthProfile) => void;
    fetchProfile: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (token, user) => {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ token, user, isAuthenticated: true });
    },

    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false });
    },

    updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser });
        }
    },

    updateHealthProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
            const updatedUser = {
                ...currentUser,
                health_profile: { ...currentUser.health_profile, ...profile }
            };
            AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser });
        }
    },

    fetchProfile: async () => {
        try {
            set({ isLoading: true });
            const response = await authApi.getProfile();
            if (response.data.success && response.data.data) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
                set({ user: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    initialize: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                const user = JSON.parse(userStr);
                set({ token, user, isAuthenticated: true });
                // Optionally fetch latest profile
                get().fetchProfile();
            }
        } catch (error) {
            console.error('Failed to initialize auth:', error);
        }
    },
}));
