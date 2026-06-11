import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type {
  MachineRow,
  CreateMachineDto,
  UpdateMachineDto,
  MachineProductionRosterRow,
} from '@/lib/types';

/**
 * Machines + daily production store (Zustand) — the "Work Efficiency" module.
 *
 * ALL `/machines` and `/machine-production` calls live here. Holds the machine
 * list, the selected day, and that day's per-machine bag-count roster.
 */

interface MachineProductionRecord {
  id: string;
  bagsProduced: number;
  note: string | null;
}

function isoToday(): string {
  // Local YYYY-MM-DD (avoids UTC off-by-one for the date picker default).
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

interface MachinesState {
  machines: MachineRow[];
  machinesLoading: boolean;

  date: string;
  roster: MachineProductionRosterRow[];
  rosterLoading: boolean;
  saving: Record<string, boolean>;

  fetchMachines: () => Promise<void>;
  createMachine: (dto: CreateMachineDto) => Promise<void>;
  updateMachine: (id: string, dto: UpdateMachineDto) => Promise<void>;
  removeMachine: (id: string) => Promise<void>;

  setDate: (date: string) => void;
  fetchRoster: (date: string) => Promise<void>;
  setProduction: (machineId: string, bagsProduced: number) => Promise<void>;
}

function isRedirected(e: unknown): boolean {
  return e instanceof ApiError && e.status === 401;
}

export const useMachinesStore = create<MachinesState>((set, get) => ({
  machines: [],
  machinesLoading: false,

  date: isoToday(),
  roster: [],
  rosterLoading: false,
  saving: {},

  fetchMachines: async () => {
    set({ machinesLoading: true });
    try {
      const machines = await prismaApi<MachineRow[]>('GET', '/machines');
      set({ machines });
    } catch (e) {
      if (!isRedirected(e)) set({ machines: [] });
    } finally {
      set({ machinesLoading: false });
    }
  },

  createMachine: async (dto) => {
    await prismaApi('POST', '/machines', dto);
    await Promise.all([get().fetchMachines(), get().fetchRoster(get().date)]);
  },

  updateMachine: async (id, dto) => {
    await prismaApi('PATCH', `/machines/${id}`, dto);
    await Promise.all([get().fetchMachines(), get().fetchRoster(get().date)]);
  },

  removeMachine: async (id) => {
    await prismaApi('DELETE', `/machines/${id}`);
    await Promise.all([get().fetchMachines(), get().fetchRoster(get().date)]);
  },

  setDate: (date) => {
    set({ date });
    get().fetchRoster(date);
  },

  fetchRoster: async (date) => {
    set({ rosterLoading: true });
    try {
      const roster = await prismaApi<MachineProductionRosterRow[]>(
        'GET',
        `/machine-production?date=${date}`,
      );
      set({ roster });
    } catch (e) {
      if (!isRedirected(e)) set({ roster: [] });
    } finally {
      set({ rosterLoading: false });
    }
  },

  // Optimistic: POST returns the record, patch roster in place (no re-GET).
  setProduction: async (machineId, bagsProduced) => {
    const date = get().date;
    set((s) => ({ saving: { ...s.saving, [machineId]: true } }));
    try {
      const rec = await prismaApi<MachineProductionRecord>('POST', '/machine-production', {
        machineId,
        date,
        bagsProduced,
      });
      set((s) => ({
        roster: s.roster.map((r) =>
          r.machineId === machineId
            ? { ...r, productionId: rec.id, bagsProduced: rec.bagsProduced, note: rec.note }
            : r,
        ),
      }));
    } finally {
      set((s) => ({ saving: { ...s.saving, [machineId]: false } }));
    }
  },
}));
