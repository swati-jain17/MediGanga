import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import type { User, HealthProfile } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    updateHealthProfile: (profile: HealthProfile) => void;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: (token, user) => {
                localStorage.setItem('token', token);
                set({ token, user, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ token: null, user: null, isAuthenticated: false });
            },

            updateUser: (userData) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...userData } });
                }
            },

            updateHealthProfile: (profile) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: {
                            ...currentUser,
                            health_profile: { ...currentUser.health_profile, ...profile }
                        }
                    });
                }
            },

            fetchProfile: async () => {
                try {
                    set({ isLoading: true });
                    const response = await authApi.getProfile();
                    if (response.data.success && response.data.data) {
                        set({ user: response.data.data });
                    }
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            updateProfile: async (data: Partial<User>) => {
                try {
                    const response = await authApi.updateProfile({
                        ...data,
                        name: data.name || undefined,
                        email: data.email || undefined,
                        phone: data.phone || undefined
                    });
                    if (response.data.success && response.data.data) {
                        set(state => ({
                            user: { ...state.user, ...response.data.data }
                        }));
                        import('./toastStore').then(({ useToastStore }) => {
                            useToastStore.getState().addToast('Profile updated successfully', 'success');
                        });
                    }
                } catch (error) {
                    console.error('Failed to update profile:', error);
                    import('./toastStore').then(({ useToastStore }) => {
                        useToastStore.getState().addToast('Failed to update profile', 'error');
                    });
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
