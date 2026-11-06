import { create } from 'zustand';
import { apiRequest } from '../lib/api';

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  variantTitle: string;
  sku: string;
  attributes: Record<string, string>;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

interface CartStore {
  isOpen: boolean;
  isLoading: boolean;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  isOpen: false,
  isLoading: false,
  items: [],
  itemCount: 0,
  subtotal: 0,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const data = await apiRequest<{ id: string; items: CartItem[]; itemCount: number; subtotal: number }>('/cart');
      set({
        items: data.items || [],
        itemCount: data.itemCount || 0,
        subtotal: data.subtotal || 0,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId: string, quantity = 1) => {
    try {
      set({ isLoading: true });
      const data = await apiRequest<{ id: string; items: CartItem[]; itemCount: number; subtotal: number }>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId, quantity }),
      });
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotal: data.subtotal,
        isOpen: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number) => {
    try {
      set({ isLoading: true });
      const data = await apiRequest<{ id: string; items: CartItem[]; itemCount: number; subtotal: number }>(`/cart/items/${cartItemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotal: data.subtotal,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  removeItem: async (cartItemId: string) => {
    try {
      set({ isLoading: true });
      const data = await apiRequest<{ id: string; items: CartItem[]; itemCount: number; subtotal: number }>(`/cart/items/${cartItemId}`, {
        method: 'DELETE',
      });
      set({
        items: data.items,
        itemCount: data.itemCount,
        subtotal: data.subtotal,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));
