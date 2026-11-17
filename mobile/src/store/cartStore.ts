import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { medicinesApi, interactionsApi } from '../services/api';
import type { CartItem, DrugInteraction, GenericAlternative } from '../types';

interface CartState {
    items: CartItem[];
    interactions: DrugInteraction[];
    isCheckingInteractions: boolean;

    // Computed
    totalItems: () => number;
    subtotal: () => number;
    totalSavings: () => number;
    requiresPrescription: () => boolean;
    hasBlockingInteractions: () => boolean;
    hasMajorInteractions: () => boolean;

    // Actions
    addItem: (item: Omit<CartItem, 'genericAlternative'>) => Promise<void>;
    removeItem: (medicineId: string) => void;
    updateQuantity: (medicineId: string, quantity: number) => void;
    switchToGeneric: (medicineId: string) => void;
    switchToBranded: (medicineId: string) => void;
    checkInteractions: () => Promise<void>;
    clearCart: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useCartStore = create<CartState>()((set, get) => ({
    items: [],
    interactions: [],
    isCheckingInteractions: false,

    // Computed getters
    totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

    subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    totalSavings: () => get().items.reduce((sum, item) => {
        if (item.isGeneric && item.genericAlternative) {
            return sum + item.genericAlternative.savings * item.quantity;
        }
        return sum;
    }, 0),

    requiresPrescription: () => get().items.some(item =>
        ['H', 'H1', 'X'].includes(item.scheduleType)
    ),

    hasBlockingInteractions: () => get().interactions.some(i => i.severity === 'CONTRAINDICATED'),

    hasMajorInteractions: () => get().interactions.some(i => i.severity === 'MAJOR'),

    // Actions
    addItem: async (item) => {
        const existingIndex = get().items.findIndex(i => i.medicineId === item.medicineId);

        if (existingIndex >= 0) {
            // Update quantity if already in cart
            const items = [...get().items];
            items[existingIndex].quantity += item.quantity;
            set({ items });
        } else {
            // Fetch generic alternative
            let genericAlternative: GenericAlternative | undefined;
            try {
                const response = await medicinesApi.getGenericAlternative(item.medicineId);
                if (response.data.success && response.data.data) {
                    genericAlternative = response.data.data;
                }
            } catch {
                // No generic available
            }

            set(state => ({
                items: [...state.items, { ...item, genericAlternative }]
            }));
        }

        // Save to AsyncStorage
        const items = get().items;
        await AsyncStorage.setItem('cart', JSON.stringify(items));

        // Check interactions
        await get().checkInteractions();
    },

    removeItem: (medicineId) => {
        const items = get().items.filter(i => i.medicineId !== medicineId);
        set({ items });
        AsyncStorage.setItem('cart', JSON.stringify(items));
        get().checkInteractions();
    },

    updateQuantity: (medicineId, quantity) => {
        if (quantity < 1) {
            get().removeItem(medicineId);
            return;
        }

        const items = get().items.map(item =>
            item.medicineId === medicineId ? { ...item, quantity } : item
        );
        set({ items });
        AsyncStorage.setItem('cart', JSON.stringify(items));
    },

    switchToGeneric: (medicineId) => {
        const items = get().items.map(item => {
            if (item.medicineId === medicineId && item.genericAlternative && !item.isGeneric) {
                return {
                    ...item,
                    medicineId: item.genericAlternative.id,
                    name: item.genericAlternative.name,
                    price: item.genericAlternative.price,
                    manufacturer: item.genericAlternative.manufacturer,
                    isGeneric: true,
                };
            }
            return item;
        });
        set({ items });
        AsyncStorage.setItem('cart', JSON.stringify(items));
        get().checkInteractions();
    },

    switchToBranded: (medicineId) => {
        const items = get().items.map(item => {
            if (item.medicineId === medicineId && item.isGeneric) {
                return {
                    ...item,
                    price: item.originalPrice,
                    isGeneric: false,
                };
            }
            return item;
        });
        set({ items });
        AsyncStorage.setItem('cart', JSON.stringify(items));
    },

    checkInteractions: async () => {
        const items = get().items;
        if (items.length < 2) {
            set({ interactions: [] });
            return;
        }

        set({ isCheckingInteractions: true });

        try {
            const medicineIds = items.map(i => i.medicineId);
            const response = await interactionsApi.check(medicineIds);

            if (response.data.success && response.data.data) {
                set({ interactions: response.data.data });
            }
        } catch (error) {
            console.error('Failed to check interactions:', error);
        } finally {
            set({ isCheckingInteractions: false });
        }
    },

    clearCart: async () => {
        set({ items: [], interactions: [] });
        await AsyncStorage.removeItem('cart');
    },

    initialize: async () => {
        try {
            const cartStr = await AsyncStorage.getItem('cart');
            if (cartStr) {
                const items = JSON.parse(cartStr);
                set({ items });
            }
        } catch (error) {
            console.error('Failed to initialize cart:', error);
        }
    },
}));
