import { create } from 'zustand';
import { apiRequest } from '../lib/api';
import { AuthUserResponse } from '@commerceos/contracts';

export interface ExtendedUserProfile extends AuthUserResponse {
  phone?: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
}

const PROFILE_STORAGE_KEY = 'nusava_user_profile_override';

function getStoredProfileOverride(): Partial<ExtendedUserProfile> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
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
    const override = getStoredProfileOverride();
    try {
      set({ isLoading: true });
      const apiUser = await apiRequest<AuthUserResponse>('/auth/me');
      const mergedUser: ExtendedUserProfile = {
        ...apiUser,
        ...(override || {}),
      };
      set({ user: mergedUser, isLoading: false });
    } catch {
      if (override && override.firstName) {
        set({
          user: {
            id: 'local-member-1',
            email: override.email || 'budi.santoso@email.id',
            firstName: override.firstName,
            lastName: override.lastName || '',
            role: 'CUSTOMER' as any,
            phone: override.phone || '0812-3456-7890',
            birthDate: override.birthDate || '1994-08-17',
            gender: override.gender || 'Laki-laki',
          },
          isLoading: false,
        });
      } else {
        set({ user: null, isLoading: false });
      }
    }
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore error on logout
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
    set({ user: null });
  },

  setUser: (user) => set({ user, isLoading: false }),

  updateProfile: (updates) => {
    const current = get().user;
    const baseUser: ExtendedUserProfile = current || {
      id: 'local-member-1',
      email: 'budi.santoso@email.id',
      firstName: 'Budi',
      lastName: 'Santoso',
      role: 'CUSTOMER' as any,
      phone: '0812-3456-7890',
      birthDate: '1994-08-17',
      gender: 'Laki-laki',
    };

    const updated: ExtendedUserProfile = {
      ...baseUser,
      ...updates,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
    }

    set({ user: updated });
  },
}));
