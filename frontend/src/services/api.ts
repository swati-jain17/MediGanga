import axios, { type AxiosError, type AxiosResponse } from 'axios';
import type { ApiResponse, GenericAlternative, Consultation } from '../types';

// Create axios instance with base config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get image URL (handles both local uploads and Cloudinary)
export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('https') || path.includes('cloudinary')) return path;

    // Static assets (medicines, assets) should be served from frontend 
    // OR from backend if verified that backend serves them.
    // Moving to backend serving to ensure consistency across deployments.
    if (path.includes('/medicines/') || path.includes('/assets/')) {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        if (!baseUrl && !window.location.hostname.includes('localhost')) {
            const prodBackend = 'https://mediganga-backend.onrender.com';
            return `${prodBackend}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        if (baseUrl) {
            const domain = baseUrl.endsWith('/api') ? baseUrl.split('/api')[0] : baseUrl;
            return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        return path.startsWith('/') ? path : `/${path}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL || '';

    if (!baseUrl && !window.location.hostname.includes('localhost')) {
        const prodBackend = 'https://mediganga-backend.onrender.com';
        return `${prodBackend}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    if (!baseUrl) return path.startsWith('/') ? path : `/${path}`;

    const domain = baseUrl.split('/api')[0];
    return `${domain}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiResponse>) => {
        // Don't redirect if it's a login attempt failure (expected 401)
        if (error.config?.url?.includes('/auth/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');

            // Redirect based on current path
            if (window.location.pathname.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ============================================
// Auth API
// ============================================
export const authApi = {
    register: (email: string, password: string, name?: string, phone?: string) =>
        api.post<ApiResponse<{ token: string; user: any; isNewUser: boolean }>>('/auth/register', { email, password, name, phone }),

    login: (email: string, password: string) =>
        api.post<ApiResponse<{ token: string; user: any; isNewUser: boolean }>>('/auth/login', { email, password }),

    getProfile: () =>
        api.get<ApiResponse<any>>('/auth/profile'),

    updateProfile: (data: { name?: string; email?: string; phone?: string; health_profile?: any }) =>
        api.put<ApiResponse<any>>('/auth/profile', data),

    forgotPassword: (email: string) =>
        api.post<ApiResponse<void>>('/auth/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
        api.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword }),
};

// ============================================
// Medicines API
// ============================================
export const medicinesApi = {
    search: (params: { query?: string; page?: number; limit?: number; schedule_type?: string; is_ayurvedic?: boolean; category?: string }) =>
        api.get<ApiResponse & { data: any[]; pagination: any }>('/medicines/search', { params }),

    getById: (id: string) =>
        api.get<ApiResponse<any>>(`/medicines/${id}`),

    getGenericAlternative: (id: string) =>
        api.get<ApiResponse<GenericAlternative>>(`/medicines/${id}/generic`),

    getCategories: () =>
        api.get<ApiResponse<{ category: string; count: number }[]>>('/medicines/categories'),

    getAyurveda: (page = 1, limit = 20) =>
        api.get<ApiResponse & { data: any[]; pagination: any }>('/medicines/ayurveda', { params: { page, limit } }),

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
// Dark Stores API
// ============================================
export const darkStoresApi = {
    getCities: () =>
        api.get<ApiResponse<string[]>>('/darkstores/cities'),

    findNearest: (location: { latitude: number; longitude: number }) =>
        api.post<ApiResponse<any>>('/darkstores/nearest', { location }),

    checkServiceable: (location: { latitude: number; longitude: number }) =>
        api.post<ApiResponse<{ serviceable: boolean }>>('/darkstores/check-serviceable', { location }),

    getByCity: (city: string) =>
        api.get<ApiResponse<any[]>>(`/darkstores/city/${city}`),

    getInventory: (id: string, params?: { category?: string; search?: string }) =>
        api.get<ApiResponse<any[]>>(`/darkstores/${id}/inventory`, { params }),
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

    initiatePayment: (orderId: string, paymentMethod: 'razorpay' | 'phonepe' = 'razorpay') =>
        api.post<ApiResponse<any>>('/orders/payment/initiate', { orderId, paymentMethod }),

    checkPhonePeStatus: (orderId: string, transactionId: string) =>
        api.get<ApiResponse<{ status: 'paid' | 'pending' | 'failed' | 'error' }>>(`/orders/${orderId}/payment/phonepe/status`, { params: { transactionId } }),

    verifyPayment: (data: {
        orderId: string;
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) => api.post<ApiResponse<void>>('/orders/payment/verify', data),
};

// ============================================
// Subscription API (Membership)
// ============================================
export const subscriptionApi = {
    getPlans: () =>
        api.get<ApiResponse<any[]>>('/subscription/plans'),

    getMySubscription: () =>
        api.get<ApiResponse<any>>('/subscription/me'),

    subscribe: (data: { planId: string; billingCycle?: 'monthly' | 'yearly'; paymentId?: string; paymentMethod?: 'razorpay' | 'phonepe' }) =>
        api.post<ApiResponse<any>>('/subscription/subscribe', data),

    cancel: () =>
        api.post<ApiResponse<void>>('/subscription/cancel'),
};

// ============================================
// Loyalty API (GangaPoints)
// ============================================
export const loyaltyApi = {
    getBalance: () =>
        api.get<ApiResponse<{
            balance: number;
            totalEarned: number;
            totalRedeemed: number;
            streak: any;
            transactions: any[];
            rewards: any;
        }>>('/loyalty/balance'),

    getRewards: () =>
        api.get<ApiResponse<any[]>>('/loyalty/rewards'),

    redeem: (points: number) =>
        api.post<ApiResponse<{ pointsRedeemed: number; discountAmount: number }>>('/loyalty/redeem', { points }),

    recordAdherence: () =>
        api.post<ApiResponse<{ currentStreak: number; bonusPoints: number }>>('/loyalty/adherence'),
};

// ============================================
// Emergency API (MediGanga Rapid)
// ============================================
export const emergencyApi = {
    checkAvailability: (latitude: number, longitude: number) =>
        api.get<ApiResponse<{
            available: boolean;
            store?: any;
            surgeFee?: number;
            estimatedMinutes?: number;
            message?: string;
        }>>('/emergency/check', { params: { latitude, longitude } }),

    getCategories: () =>
        api.get<ApiResponse<any[]>>('/emergency/categories'),

    getMedicines: (params: { storeId: string; query?: string; category?: string }) =>
        api.get<ApiResponse<any[]>>('/emergency/medicines', { params }),

    createOrder: (data: { orderId: string; surgeFee: number; estimatedMinutes: number }) =>
        api.post<ApiResponse<any>>('/emergency/order', data),
};

// ============================================
// Reminders API
// ============================================
export const remindersApi = {
    getAll: () =>
        api.get<ApiResponse<{ reminders: any[]; grouped: any }>>('/reminders'),

    create: (data: {
        medicineId?: string;
        medicineName: string;
        dosage?: string;
        scheduleTime: string;
        schedulePeriod: 'morning' | 'afternoon' | 'evening' | 'night';
        frequency?: 'daily' | 'weekly' | 'alternate' | 'as_needed';
    }) => api.post<ApiResponse<any>>('/reminders', data),

    logAction: (reminderId: string, action: 'taken' | 'skipped') =>
        api.post<ApiResponse<void>>(`/reminders/${reminderId}/log`, { action }),

    delete: (reminderId: string) =>
        api.delete<ApiResponse<void>>(`/reminders/${reminderId}`),

    getTodayLogs: () =>
        api.get<ApiResponse<any[]>>('/reminders/today'),

    // Inventory
    getInventory: () =>
        api.get<ApiResponse<{ inventory: any[]; lowStock: any[]; lowStockCount: number }>>('/reminders/inventory'),

    addToInventory: (data: { medicineId: string; medicineName: string; quantity: number }) =>
        api.post<ApiResponse<any>>('/reminders/inventory', data),

    getLowStock: () =>
        api.get<ApiResponse<any[]>>('/reminders/inventory/low-stock'),
};

// ============================================
// Consultations API (Video Consults)
// ============================================
export const consultationsApi = {
    getDoctors: (params?: { specialization?: string; page?: number; limit?: number }) =>
        api.get<ApiResponse<any[]>>('/consultations/doctors', { params }),

    getDoctorById: (doctorId: string) =>
        api.get<ApiResponse<any>>(`/consultations/doctors/${doctorId}`),

    getSlots: (doctorId: string, date?: string) =>
        api.get<ApiResponse<any[]>>(`/consultations/doctors/${doctorId}/slots`, { params: { date } }),

    getSpecializations: () =>
        api.get<ApiResponse<{ specialization: string; doctor_count: number }[]>>('/consultations/specializations'),

    book: (data: {
        doctorId: string;
        slotId?: string;
        scheduledAt: string;
        useCredit?: boolean;
        patientNotes?: string;
        paymentMethod?: 'razorpay' | 'phonepe';
    }) => api.post<ApiResponse<any>>('/consultations/book', data),

    getMyConsultations: (status?: string) =>
        api.get<ApiResponse<Consultation[]>>('/consultations/my', { params: { status } }),

    getDetails: (consultationId: string) =>
        api.get<ApiResponse<any>>(`/consultations/${consultationId}`),

    start: (consultationId: string) =>
        api.post<ApiResponse<void>>(`/consultations/${consultationId}/start`),

    end: (consultationId: string, doctorNotes?: string) =>
        api.post<ApiResponse<void>>(`/consultations/${consultationId}/end`, { doctorNotes }),

    cancel: (consultationId: string) =>
        api.post<ApiResponse<void>>(`/consultations/${consultationId}/cancel`),
};

// ============================================
// Symptom Checker API
// ============================================
export const symptomCheckerApi = {
    getSymptoms: () =>
        api.get<ApiResponse<{ id: string; name: string; icon: string }[]>>('/symptom-checker/symptoms'),

    analyze: (data: { symptoms: string[]; description?: string }) =>
        api.post<ApiResponse<{
            sessionId: string;
            urgency: 'green' | 'yellow' | 'red';
            urgencyLabel: string;
            recommendation: string;
            otcSuggestions: any[];
            nextSteps: any[];
            disclaimer: string;
        }>>('/symptom-checker/analyze', data),

    getHistory: () =>
        api.get<ApiResponse<any[]>>('/symptom-checker/history'),

    markFollowedUp: (checkId: string, consultationId?: string) =>
        api.post<ApiResponse<void>>(`/symptom-checker/${checkId}/follow-up`, { consultationId }),
};

// ============================================
// OCR API
// ============================================
export const ocrApi = {
    analyze: (formData: FormData) =>
        api.post<ApiResponse<{
            raw_text: string;
            medicines: string[];
            doctor_name?: string;
            hospital_name?: string;
            confidence: number;
        }>>('/ocr/analyze', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

// ============================================
// Admin API
// ============================================
export const adminApi = {
    getDashboardStats: () => api.get<ApiResponse<any>>('/admin/dashboard'),
    getOrders: (params?: any) => api.get<ApiResponse<any[]>>('/admin/orders', { params }),
    getOrderDetails: (id: string) => api.get<ApiResponse<any>>(`/admin/orders/${id}`),
    updateOrderStatus: (id: string, status: string) => api.put<ApiResponse<any>>(`/admin/orders/${id}/status`, { status }),

    getUsers: (params?: any) => api.get<ApiResponse<any[]>>('/admin/users', { params }),
    updateUserRole: (id: string, role: string) => api.put<ApiResponse<any>>(`/admin/users/${id}/role`, { role }),

    getInventory: (params?: any) => api.get<ApiResponse<any[]>>('/admin/inventory', { params }),
    addMedicine: (data: any) => api.post<ApiResponse<any>>('/admin/inventory', data),
    updateMedicine: (id: string, data: any) => api.put<ApiResponse<any>>(`/admin/inventory/${id}`, data),
    deleteMedicine: (id: string) => api.delete<ApiResponse<any>>(`/admin/inventory/${id}`),

    getPrescriptions: (params?: any) => api.get<ApiResponse<any[]>>('/admin/prescriptions', { params }),
    verifyPrescription: (id: string, action: 'approve' | 'reject', notes?: string) =>
        api.post<ApiResponse<any>>(`/admin/prescriptions/${id}/verify`, { action, notes }),

    getPlans: () => api.get<ApiResponse<any[]>>('/admin/plans'),
    createPlan: (data: any) => api.post<ApiResponse<any>>('/admin/plans', data),
    updatePlan: (id: string, data: any) => api.put<ApiResponse<any>>(`/admin/plans/${id}`, data),
    deletePlan: (id: string) => api.delete<ApiResponse<any>>(`/admin/plans/${id}`),
};

export default api;

