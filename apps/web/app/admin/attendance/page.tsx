'use client';

import { useEffect, useMemo, useState } from 'react';
import { AttendanceStatus } from '@erp/types';
import type { AttendanceStatus as Status } from '@/lib/types';
import { SectionHeader, EmptyState, StatCard } from '@/components/admin/ui';
import { useToast } from '@/lib/store/ui-store';
import { useAttendanceStore } from '@/lib/store/attendance-store';
import { useWorkersStore } from '@/lib/store/workers-store';
import { ManageWorkersModal } from '@/components/admin/manage-workers';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const OPTIONS: { value: Status; label: string; on: string }[] = [
  { value: AttendanceStatus.PRESENT, label: 'P', on: 'bg-emerald-600 text-white' },
  { value: AttendanceStatus.HALF_DAY, label: '½', on: 'bg-amber-500 text-white' },
  { value: AttendanceStatus.ABSENT, label: 'A', on: 'bg-red-600 text-white' },
];

export default function AttendancePage() {
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [manageOpen, setManageOpen] = useState(false);

  const roster = useAttendanceStore((s) => s.roster);
  const loading = useAttendanceStore((s) => s.loading);
  const saving = useAttendanceStore((s) => s.saving);
  const fetchRoster = useAttendanceStore((s) => s.fetchRoster);
  const mark = useAttendanceStore((s) => s.mark);
  const fetchWorkers = useWorkersStore((s) => s.fetchWorkers);

  useEffect(() => {
    fetchRoster(date);
  }, [date, fetchRoster]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const counts = useMemo(() => {
    let p = 0, a = 0, h = 0, unmarked = 0;
    for (const r of roster) {
      if (r.status === 'PRESENT') p++;
      else if (r.status === 'ABSENT') a++;
      else if (r.status === 'HALF_DAY') h++;
      else unmarked++;
    }
    return { p, a, h, unmarked };
  }, [roster]);

  async function onMark(workerId: string, status: Status) {
    try {
      await mark(workerId, status);
    } catch {
      toast('Failed to mark attendance', 'error');
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow="Workforce"
        title="Daily Attendance"
        actionSlot={
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="shrink-0 rounded-lg border border-ink-faint/30 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep"
          >
            Manage workers
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-semibold text-ink">Date</label>
          <input id="date" type="date" value={date} max={todayStr()} onChange={(e) => setDate(e.target.value)} className="field w-auto" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Present" value={counts.p} accent />
        <StatCard label="Half-day" value={counts.h} />
        <StatCard label="Absent" value={counts.a} />
        <StatCard label="Not marked" value={counts.unmarked} />
      </div>

      {loading && roster.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint">Loading roster…</p>
      ) : roster.length === 0 ? (
        <EmptyState title="No active workers" hint="Add workers via “Manage workers” to mark attendance." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-faint/15 bg-paper-card shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-6 py-3 font-semibold">Worker</th>
                <th className="px-3 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 text-right font-semibold">Mark</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.workerId} className="border-t border-ink-faint/10 hover:bg-paper-deep/20">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kraft/15 font-display text-sm text-kraft-dark">
                        {r.name.trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium text-ink">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-ink-soft">{r.role ?? '—'}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-end">
                      <div className="inline-flex overflow-hidden rounded-lg border border-ink-faint/20">
                        {OPTIONS.map((opt, i) => {
                          const active = r.status === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={saving[r.workerId]}
                              onClick={() => onMark(r.workerId, opt.value)}
                              className={`h-9 w-10 text-sm font-semibold transition-colors disabled:opacity-50 ${
                                i > 0 ? 'border-l border-ink-faint/20' : ''
                              } ${active ? opt.on : 'bg-paper-card text-ink-soft hover:bg-paper-deep'}`}
                              aria-label={opt.value}
                              aria-pressed={active}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ManageWorkersModal
        open={manageOpen}
        onClose={() => {
          setManageOpen(false);
          fetchRoster(date); // pick up newly added / reactivated workers
        }}
      />
    </>
  );
}
