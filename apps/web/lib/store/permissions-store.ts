import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';

/**
 * Current user's effective tab mask (Zustand) — drives the sidebar + shell guard.
 * Per-user permission editing lives in the users store (updateTabs).
 */
interface PermissionsState {
  myTabs: number | null;
  fetchMine: (force?: boolean) => Promise<void>;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
  myTabs: null,

  fetchMine: async (force = false) => {
    if (get().myTabs !== null && !force) return;
    try {
      const res = await prismaApi<{ tabs: number }>('GET', '/permissions/me');
      set({ myTabs: res.tabs });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) set({ myTabs: 0 });
    }
  },
}));
