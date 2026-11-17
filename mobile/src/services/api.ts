import axios, { type AxiosError, type AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiResponse } from '../types';

// Base URL - you can change this based on your environment
const BASE_URL = __DEV__
    ? 'http://localhost:3000/api'  // For iOS simulator
    : 'https://your-production-api.com/api';

// Create axios instance with base config
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('token');
            // Navigate to login - you'll need to handle this in your app
        }
        return Promise.reject(error);
    }
);

// ============================================
// Auth API
// ============================================
export const authApi = {
    register: (email: string, password: string, name?: string) =>
        api.post<ApiResponse<{ token: string; user: any; isNewUser: boolean }>>('/auth/register', { email, password, name }),

    login: (email: string, password: string) =>
        api.post<ApiResponse<{ token: string; user: any; isNewUser: boolean }>>('/auth/login', { email, password }),

    getProfile: () =>
        api.get<ApiResponse<any>>('/auth/profile'),

    updateProfile: (data: { name?: string; email?: string; phone?: string; health_profile?: any }) =>
        api.put<ApiResponse<any>>('/auth/profile', data),
};

// ============================================
// Medicines API
// ============================================
export const medicinesApi = {
    search: (params: { query: string; page?: number; limit?: number; schedule_type?: string; is_ayurvedic?: boolean; category?: string }) =>
        api.get<ApiResponse & { data: any[]; pagination: any }>('/medicines/search', { params }),

    getById: (id: string) =>
        api.get<ApiResponse<any>>(`/medicines/${id}`),

    getGenericAlternative: (id: string) =>
        api.get<ApiResponse<any>>(`/medicines/${id}/generic`),

    getCategories: () =>
        api.get<ApiResponse<{ category: string; count: number }[]>>('/medicines/categories'),

    getByCategory: (category: string, page = 1, limit = 20) =>
        api.get<ApiResponse & { data: any[]; pagination: any }>(`/medicines/category/${category}`, { params: { page, limit } }),
};

// ============================================
// Prescriptions API
// ============================================
export const prescriptionsApi = {
    upload: (formData: FormData) =>
        api.post<ApiResponse<any>>('/prescriptions/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getAll: () =>
        api.get<ApiResponse<any[]>>('/prescriptions'),

    getValid: () =>
        api.get<ApiResponse<any[]>>('/prescriptions/valid'),

    getById: (id: string) =>
        api.get<ApiResponse<any>>(`/prescriptions/${id}`),
};

// ============================================
// Interactions API
// ============================================
export const interactionsApi = {
    check: (medicineIds: string[]) =>
        api.post<ApiResponse<any>>('/interactions/check', { medicineIds }),

    getMedicineInteractions: (id: string) =>
        api.get<ApiResponse<any[]>>(`/interactions/medicine/${id}`),
};

// ============================================
// Orders API
// ============================================
export const ordersApi = {
    create: (data: {
        items: { medicineId: string; quantity: number; price: number; isGeneric: boolean }[];
        deliveryAddress: string;
        deliveryLocation: { latitude: number; longitude: number };
        prescriptionId?: string;
        acknowledgedInteractions?: boolean;
    }) => api.post<ApiResponse<any>>('/orders', data),

    getAll: (params?: { status?: string; page?: number; limit?: number }) =>
        api.get<ApiResponse<any[]>>('/orders', { params }),

    getById: (id: string) =>
        api.get<ApiResponse<any>>(`/orders/${id}`),

    cancel: (id: string, reason?: string) =>
        api.post<ApiResponse<void>>(`/orders/${id}/cancel`, { reason }),
};

export default api;
