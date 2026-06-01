import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type {
  ExpensePeriodRow,
  CreateExpensePeriodDto,
  CreateExpenseItemDto,
} from '@/lib/types';

/**
 * Expenses domain store (Zustand).
 *
 * ALL `/expenses` API calls live here — components never call `prismaApi`
 * directly. Holds the periods list + the currently-open period detail, plus
 * loading flags. Mutating actions refresh their own state on success and
 * re-throw on failure so the calling component can fire a toast.
 */

interface ExpensesState {
  periods: ExpensePeriodRow[];
  periodsLoading: boolean;
  current: ExpensePeriodRow | null;
  currentLoading: boolean;

  fetchPeriods: () => Promise<void>;
  fetchPeriod: (id: string) => Promise<void>;
  clearCurrent: () => void;

  createPeriod: (dto: CreateExpensePeriodDto) => Promise<void>;
  updateBags: (id: string, totalBagsProduced: number) => Promise<void>;
  addItem: (periodId: string, dto: CreateExpenseItemDto) => Promise<void>;
  removeItem: (itemId: string, periodId: string) => Promise<void>;
}

/** Swallow 401 (prismaApi already redirects); re-throw everything else. */
function isRedirected(e: unknown): boolean {
  return e instanceof ApiError && e.status === 401;
}

export const useExpensesStore = create<ExpensesState>((set, get) => ({
  periods: [],
  periodsLoading: false,
  current: null,
  currentLoading: false,

  fetchPeriods: async () => {
    set({ periodsLoading: true });
    try {
      const periods = await prismaApi<ExpensePeriodRow[]>('GET', '/expenses/periods');
      set({ periods });
    } catch (e) {
      if (!isRedirected(e)) set({ periods: [] });
    } finally {
      set({ periodsLoading: false });
    }
  },

  fetchPeriod: async (id) => {
    set({ currentLoading: true });
    try {
      const current = await prismaApi<ExpensePeriodRow>('GET', `/expenses/periods/${id}`);
      set({ current });
    } catch (e) {
      if (!isRedirected(e)) set({ current: null });
    } finally {
      set({ currentLoading: false });
    }
  },

  clearCurrent: () => set({ current: null }),

  createPeriod: async (dto) => {
    await prismaApi('POST', '/expenses/periods', dto);
    await get().fetchPeriods();
  },

  updateBags: async (id, totalBagsProduced) => {
    await prismaApi('PATCH', `/expenses/periods/${id}`, { totalBagsProduced });
    await Promise.all([get().fetchPeriod(id), get().fetchPeriods()]);
  },

  addItem: async (periodId, dto) => {
    await prismaApi('POST', `/expenses/periods/${periodId}/items`, dto);
    await Promise.all([get().fetchPeriod(periodId), get().fetchPeriods()]);
  },

  removeItem: async (itemId, periodId) => {
    await prismaApi('DELETE', `/expenses/items/${itemId}`);
    await Promise.all([get().fetchPeriod(periodId), get().fetchPeriods()]);
  },
}));
