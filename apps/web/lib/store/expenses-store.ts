import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type { DailyExpenseDay, CreateDailyExpenseDto } from '@/lib/types';

/**
 * Daily expenses store (Zustand) — the incoming/outgoing cash book.
 *
 * ALL `/expenses` API calls live here. Holds recent days (each with its entries
 * + incoming/outgoing/net totals). Mutating actions refresh state on success
 * and re-throw on failure so the component can toast.
 */

interface ExpensesState {
  days: DailyExpenseDay[];
  loading: boolean;
  loaded: boolean; // cache flag — true once fetched

  fetchRecent: (force?: boolean) => Promise<void>;
  addEntry: (dto: CreateDailyExpenseDto) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

function isRedirected(e: unknown): boolean {
  return e instanceof ApiError && e.status === 401;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  days: [],
  loading: false,
  loaded: false,

  // Cache-first: skip the API call if already loaded (unless forced).
  fetchRecent: async (force = false) => {
    if (get().loaded && !force) return;
    set({ loading: true });
    try {
      const days = await prismaApi<DailyExpenseDay[]>('GET', '/expenses?days=60');
      set({ days, loaded: true });
    } catch (e) {
      if (!isRedirected(e)) set({ days: [] });
    } finally {
      set({ loading: false });
    }
  },

  addEntry: async (dto) => {
    await prismaApi('POST', '/expenses', dto);
    await get().fetchRecent(true);
  },

  removeEntry: async (id) => {
    await prismaApi('DELETE', `/expenses/${id}`);
    await get().fetchRecent(true);
  },
}));
