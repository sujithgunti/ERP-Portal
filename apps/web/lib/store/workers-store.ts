import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type { WorkerRow, CreateWorkerDto, UpdateWorkerDto } from '@/lib/types';

/**
 * Workers domain store (Zustand). ALL `/workers` API calls live here.
 * Mutations refresh the list on success; read errors (non-401) clear it.
 */

interface WorkersState {
  workers: WorkerRow[];
  loading: boolean;
  loaded: boolean;
  fetchWorkers: (force?: boolean) => Promise<void>;
  createWorker: (dto: CreateWorkerDto) => Promise<void>;
  updateWorker: (id: string, dto: UpdateWorkerDto) => Promise<void>;
  removeWorker: (id: string) => Promise<void>;
}

export const useWorkersStore = create<WorkersState>((set, get) => ({
  workers: [],
  loading: false,
  loaded: false,

  fetchWorkers: async (force = false) => {
    if (get().loaded && !force) return;
    set({ loading: true });
    try {
      set({ workers: await prismaApi<WorkerRow[]>('GET', '/workers'), loaded: true });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) set({ workers: [] });
    } finally {
      set({ loading: false });
    }
  },

  createWorker: async (dto) => {
    await prismaApi('POST', '/workers', dto);
    await get().fetchWorkers(true);
  },

  updateWorker: async (id, dto) => {
    await prismaApi('PATCH', `/workers/${id}`, dto);
    await get().fetchWorkers(true);
  },

  removeWorker: async (id) => {
    await prismaApi('DELETE', `/workers/${id}`);
    await get().fetchWorkers(true);
  },
}));
