import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type { AttendanceRosterRow, AttendanceStatus } from '@/lib/types';

/** Shape returned by POST /attendance (the upserted record). */
interface AttendanceRecord {
  id: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  note: string | null;
}

/**
 * Attendance store (Zustand). ALL `/attendance` API calls live here.
 * Holds the day's roster (active workers + their status). `mark` upserts one
 * worker's status for the current date, then refreshes the roster.
 */

interface AttendanceState {
  date: string; // YYYY-MM-DD
  roster: AttendanceRosterRow[];
  loading: boolean;
  saving: Record<string, boolean>; // per-worker mark in flight

  setDate: (date: string) => void;
  fetchRoster: (date: string) => Promise<void>;
  mark: (
    workerId: string,
    status: AttendanceStatus,
    checkIn?: string | null,
    checkOut?: string | null,
  ) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  date: '',
  roster: [],
  loading: false,
  saving: {},

  setDate: (date) => set({ date }),

  fetchRoster: async (date) => {
    set({ loading: true, date });
    try {
      const roster = await prismaApi<AttendanceRosterRow[]>('GET', `/attendance?date=${date}`);
      set({ roster });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) set({ roster: [] });
    } finally {
      set({ loading: false });
    }
  },

  mark: async (workerId, status, checkIn, checkOut) => {
    const date = get().date;
    set((s) => ({ saving: { ...s.saving, [workerId]: true } }));
    try {
      // POST upserts the mark and returns the record. Patch the roster in the
      // store from the response — no follow-up GET. The page reads roster from
      // this state, so the UI (rows + stat counts) updates instantly.
      const rec = await prismaApi<AttendanceRecord>('POST', '/attendance', {
        workerId,
        date,
        status,
        checkIn: checkIn ?? null,
        checkOut: checkOut ?? null,
      });
      set((s) => ({
        roster: s.roster.map((r) =>
          r.workerId === workerId
            ? {
                ...r,
                status: rec.status,
                attendanceId: rec.id,
                checkIn: rec.checkIn ?? null,
                checkOut: rec.checkOut ?? null,
                note: rec.note ?? null,
              }
            : r,
        ),
      }));
    } finally {
      set((s) => ({ saving: { ...s.saving, [workerId]: false } }));
    }
  },
}));
