import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { AuthUserResponse } from '@commerceos/contracts';

export interface ExtendedUserProfile extends AuthUserResponse {
  phone?: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
}

function getProfileStorageKey(userId: string) {
  return `nusava_user_profile_${userId}`;
}

function getStoredProfileOverride(userId: string): Partial<ExtendedUserProfile> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getProfileStorageKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface AuthStore {
  user: ExtendedUserProfile | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: ExtendedUserProfile | null) => void;
  updateProfile: (updates: Partial<ExtendedUserProfile>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const apiUser = await apiRequest<AuthUserResponse>('/auth/me');
      const override = getStoredProfileOverride(apiUser.id);
      const mergedUser: ExtendedUserProfile = {
        ...apiUser,
        ...(override || {}),
      };
      set({ user: mergedUser, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore error on logout
    }
    set({ user: null });
  },

  setUser: (user) => {
    if (!user) {
      set({ user: null, isLoading: false });
      return;
    }
    const override = getStoredProfileOverride(user.id);
    set({
      user: {
        ...user,
        ...(override || {}),
      },
      isLoading: false,
    });
  },

  updateProfile: (updates) => {
    const current = get().user;
    if (!current) return;

    const updated: ExtendedUserProfile = {
      ...current,
      ...updates,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(getProfileStorageKey(current.id), JSON.stringify(updated));
    }

    set({ user: updated });
  },
}));
