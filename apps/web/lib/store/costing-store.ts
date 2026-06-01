import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type { OrderCostBreakdown, SetOrderCostDto } from '@/lib/types';

/**
 * Order-costing store (Zustand).
 *
 * ALL `/orders/:id/cost` API calls live here. Breakdowns are cached per order
 * id so multiple order pages don't clash. Components read `byOrder[orderId]`
 * and call `fetchCost` / `setCost`.
 */

interface CostingState {
  byOrder: Record<string, OrderCostBreakdown>;
  loading: Record<string, boolean>;

  fetchCost: (orderId: string) => Promise<void>;
  setCost: (orderId: string, dto: SetOrderCostDto) => Promise<void>;
}

export const useCostingStore = create<CostingState>((set, get) => ({
  byOrder: {},
  loading: {},

  fetchCost: async (orderId) => {
    set((s) => ({ loading: { ...s.loading, [orderId]: true } }));
    try {
      const breakdown = await prismaApi<OrderCostBreakdown>('GET', `/orders/${orderId}/cost`);
      set((s) => ({ byOrder: { ...s.byOrder, [orderId]: breakdown } }));
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        // leave any prior breakdown in place on transient failure
      }
    } finally {
      set((s) => ({ loading: { ...s.loading, [orderId]: false } }));
    }
  },

  setCost: async (orderId, dto) => {
    const breakdown = await prismaApi<OrderCostBreakdown>('PUT', `/orders/${orderId}/cost`, dto);
    set((s) => ({ byOrder: { ...s.byOrder, [orderId]: breakdown } }));
    // ensure freshest computed values (overhead may depend on live ledger)
    await get().fetchCost(orderId);
  },
}));
