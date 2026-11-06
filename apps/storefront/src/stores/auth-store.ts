import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { AuthUserResponse } from '@commerceos/contracts';

interface AuthStore {
  user: AuthUserResponse | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUserResponse | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const user = await apiRequest<AuthUserResponse>('/auth/me');
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      set({ user: null });
    } catch {
      set({ user: null });
    }
  },

  setUser: (user) => set({ user, isLoading: false }),
}));
