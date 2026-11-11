import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  category?: string;
  origin?: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => boolean;
  isInWishlist: (id: string) => boolean;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (item: WishlistItem) => {
        const exists = get().items.some((it) => it.id === item.id);
        if (exists) {
          set({ items: get().items.filter((it) => it.id !== item.id) });
          return false;
        } else {
          set({ items: [...get().items, item] });
          return true;
        }
      },

      isInWishlist: (id: string) => {
        return get().items.some((it) => it.id === id);
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter((it) => it.id !== id) });
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'commerceos_wishlist',
    },
  ),
);
