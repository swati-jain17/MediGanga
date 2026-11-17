import { create } from 'zustand';
import { ordersApi } from '../services/api';
import type { Order, OrderStatus } from '../types';

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    riderLocation: { latitude: number; longitude: number } | null;
    isLoading: boolean;

    // Actions
    fetchOrders: () => Promise<void>;
    fetchOrderById: (id: string) => Promise<void>;
    setRiderLocation: (location: { latitude: number; longitude: number }) => void;
    updateOrderStatus: (status: OrderStatus) => void;
    cancelOrder: (orderId: string, reason?: string) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    currentOrder: null,
    riderLocation: null,
    isLoading: false,

    fetchOrders: async () => {
        set({ isLoading: true });
        try {
            const response = await ordersApi.getAll();
            if (response.data.success && response.data.data) {
                set({ orders: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchOrderById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await ordersApi.getById(id);
            if (response.data.success && response.data.data) {
                set({ currentOrder: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    setRiderLocation: (location) => {
        set({ riderLocation: location });
    },

    updateOrderStatus: (status) => {
        set(state => ({
            currentOrder: state.currentOrder
                ? { ...state.currentOrder, status }
                : null
        }));
    },

    cancelOrder: async (orderId, reason) => {
        try {
            const response = await ordersApi.cancel(orderId, reason);
            if (response.data.success) {
                // Update local state
                set(state => ({
                    orders: state.orders.map(o =>
                        o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o
                    ),
                    currentOrder: state.currentOrder?.id === orderId
                        ? { ...state.currentOrder, status: 'cancelled' as OrderStatus }
                        : state.currentOrder
                }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to cancel order:', error);
            return false;
        }
    },
}));
