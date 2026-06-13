import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type {
  OrderReportRow,
  ExpenseReportRow,
  WorkEfficiencyReportRow,
  ReportResult,
} from '@/lib/types';

/**
 * Reports store (Zustand). Read-only GET queries over a date range, one per
 * module. All `/reports` calls live here.
 */

export type ReportKind = 'orders' | 'expenses' | 'work-efficiency';

type AnyReport =
  | ReportResult<OrderReportRow>
  | ReportResult<ExpenseReportRow>
  | ReportResult<WorkEfficiencyReportRow>;

interface ReportsState {
  from: string;
  to: string;
  loading: boolean;
  data: Partial<Record<ReportKind, AnyReport>>;
  fetchedKeys: Partial<Record<ReportKind, string>>; // `${from}|${to}` last fetched per kind

  setRange: (from: string, to: string) => void;
  fetch: (kind: ReportKind, force?: boolean) => Promise<void>;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  from: '',
  to: '',
  loading: false,
  data: {},
  fetchedKeys: {},

  // Changing the range invalidates the cache for all kinds.
  setRange: (from, to) => set({ from, to, fetchedKeys: {} }),

  // Cache-first per (kind + range): skip refetch when already loaded for this range.
  fetch: async (kind, force = false) => {
    const { from, to } = get();
    const key = `${from}|${to}`;
    if (!force && get().fetchedKeys[kind] === key && get().data[kind]) return;

    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    set({ loading: true });
    try {
      const res = await prismaApi<AnyReport>('GET', `/reports/${kind}${suffix}`);
      set((s) => ({ data: { ...s.data, [kind]: res }, fetchedKeys: { ...s.fetchedKeys, [kind]: key } }));
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        set((s) => ({ data: { ...s.data, [kind]: undefined } }));
      }
    } finally {
      set({ loading: false });
    }
  },
}));
