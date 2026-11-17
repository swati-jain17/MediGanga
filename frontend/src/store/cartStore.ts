import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { medicinesApi, interactionsApi } from '../services/api';
import type { CartItem, DrugInteraction, GenericAlternative } from '../types';

interface CartState {
    items: CartItem[];
    interactions: DrugInteraction[];
    isCheckingInteractions: boolean;

    // Substitute Modal State
    substituteModalOpen: boolean;
    currentSubstitute: (GenericAlternative & { originalId: string; originalPrice: number; saltComposition?: string }) | null;
    closeSubstituteModal: () => void;
    confirmSubstitute: () => void;

    // Computed
    totalItems: () => number;
    subtotal: () => number;
    totalSavings: () => number;
    requiresPrescription: () => boolean;
    hasBlockingInteractions: () => boolean;
    hasMajorInteractions: () => boolean;
    hasEmergencyItems: () => boolean;

    // Actions
    addItem: (item: Omit<CartItem, 'genericAlternative'>) => Promise<void>;
    removeItem: (medicineId: string) => void;
    updateQuantity: (medicineId: string, quantity: number) => void;
    switchToGeneric: (medicineId: string) => void;
    switchToBranded: (medicineId: string) => void;
    checkInteractions: () => Promise<void>;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            interactions: [],
            isCheckingInteractions: false,
            substituteModalOpen: false,
            currentSubstitute: null,

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

            hasEmergencyItems: () => get().items.some(item => item.isEmergency),

            // Actions
            addItem: async (item) => {
                const existingIndex = get().items.findIndex(i => i.medicineId === item.medicineId);

                // 1. Check if item already exists
                if (existingIndex >= 0) {
                    const items = [...get().items];
                    items[existingIndex].quantity += item.quantity;
                    set({ items });
                    import('./toastStore').then(({ useToastStore }) => {
                        useToastStore.getState().addToast(`Updated quantity for ${item.name}`, 'info');
                    });
                } else {
                    // 2. Fetch generic alternative (if not already generic)
                    let genericAlternative: GenericAlternative | undefined;

                    if (!item.isGeneric) {
                        try {
                            const response = await medicinesApi.getGenericAlternative(item.medicineId);
                            if (response.data.success && response.data.data) {
                                genericAlternative = response.data.data;

                                // TRIGGER MODAL if savings > 0
                                if (genericAlternative && genericAlternative.savings > 0) {
                                    set({
                                        substituteModalOpen: true,
                                        currentSubstitute: {
                                            id: genericAlternative.id,
                                            name: genericAlternative.name,
                                            manufacturer: genericAlternative.manufacturer,
                                            price: genericAlternative.price,
                                            savings: genericAlternative.savings,
                                            savings_percent: genericAlternative.savings_percent,
                                            originalId: item.medicineId,
                                            originalPrice: item.price,
                                            saltComposition: 'Same Composition'
                                        }
                                    });
                                }
                            }
                        } catch {
                            // No generic available
                        }
                    }

                    // 3. Add to cart
                    set(state => ({
                        items: [...state.items, { ...item, genericAlternative }]
                    }));

                    import('./toastStore').then(({ useToastStore }) => {
                        useToastStore.getState().addToast(`${item.name} added to cart`, 'success');
                    });
                }

                // Check interactions
                await get().checkInteractions();
            },

            removeItem: (medicineId) => {
                set(state => ({
                    items: state.items.filter(i => i.medicineId !== medicineId)
                }));
                get().checkInteractions();
            },

            updateQuantity: (medicineId, quantity) => {
                if (quantity < 1) {
                    get().removeItem(medicineId);
                    return;
                }

                set(state => ({
                    items: state.items.map(item =>
                        item.medicineId === medicineId ? { ...item, quantity } : item
                    )
                }));
            },

            switchToGeneric: (medicineId) => {
                set(state => ({
                    items: state.items.map(item => {
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
                    })
                }));
                get().checkInteractions();
            },

            switchToBranded: (medicineId) => {
                set(state => ({
                    items: state.items.map(item => {
                        if (item.medicineId === medicineId && item.isGeneric) {
                            return {
                                ...item,
                                price: item.originalPrice || item.price, // Fallback
                                isGeneric: false,
                            };
                        }
                        return item;
                    })
                }));
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

            clearCart: () => {
                set({ items: [], interactions: [] });
            },

            closeSubstituteModal: () => {
                set({ substituteModalOpen: false, currentSubstitute: null });
            },

            confirmSubstitute: () => {
                const { currentSubstitute, switchToGeneric } = get();
                if (currentSubstitute) {
                    switchToGeneric(currentSubstitute.originalId);

                    import('./toastStore').then(({ useToastStore }) => {
                        useToastStore.getState().addToast(`Switched to ${currentSubstitute.name} and saved ₹${currentSubstitute.savings}!`, 'success');
                    });
                }
                set({ substituteModalOpen: false, currentSubstitute: null });
            }
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
