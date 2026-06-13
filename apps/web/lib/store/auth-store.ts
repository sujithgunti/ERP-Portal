import { create } from 'zustand';
import type { AuthUser } from '@erp/types';
import { getStoredUser, getToken, storeAuth, clearAuth } from '@/lib/auth-client';

/**
 * Current authenticated user (Zustand) — id, name, email, role + token.
 *
 * localStorage stays the persistence layer (so the JWT survives reloads and
 * `prismaApi` can read the token); this store mirrors it as reactive state.
 * Call `hydrate()` once on mount to populate from localStorage. Initial state
 * is null to avoid SSR/client hydration mismatch.
 */

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (token, user) => {
    storeAuth(token, user); // persist
    set({ token, user });
  },

  clear: () => {
    clearAuth();
    set({ token: null, user: null });
  },

  hydrate: () => set({ user: getStoredUser(), token: getToken() }),
}));
