'use client';

import { useEffect, useMemo, useState } from 'react';
import { AttendanceStatus } from '@erp/types';
import type { AttendanceStatus as Status, AttendanceRosterRow } from '@/lib/types';
import { SectionHeader, EmptyState, StatCard } from '@/components/admin/ui';
import { useToast } from '@/lib/store/ui-store';
import { useAttendanceStore } from '@/lib/store/attendance-store';
import { useWorkersStore } from '@/lib/store/workers-store';
import { ManageWorkersModal } from '@/components/admin/manage-workers';
import { DatePicker } from '@/components/ui/date-picker';
import { ClockIcon } from '@/components/icons';
import { AdminOnly, useIsAdmin } from '@/components/auth/admin-only';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const OPTIONS: { value: Status; label: string; on: string }[] = [
  { value: AttendanceStatus.PRESENT, label: 'P', on: 'bg-emerald-600 text-white' },
  { value: AttendanceStatus.HALF_DAY, label: '½', on: 'bg-amber-500 text-white' },
  { value: AttendanceStatus.ABSENT, label: 'A', on: 'bg-red-600 text-white' },
];

/** "10:00" → "10:00 AM"; "" → "". */
function fmt12(t: string | null): string {
  if (!t) return '';
  const [hStr, m] = t.split(':');
  const h = Number(hStr);
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ap}`;
}

/** Hours between two HH:MM strings (handles same-day). */
function durationHours(inT: string | null, outT: string | null): number | null {
  if (!inT || !outT) return null;
  const [ih, im] = inT.split(':').map(Number);
  const [oh, om] = outT.split(':').map(Number);
  const mins = oh * 60 + om - (ih * 60 + im);
  return mins > 0 ? Math.round((mins / 60) * 10) / 10 : null;
}

export default function AttendancePage() {
  const [date, setDate] = useState(todayStr());
  const [manageOpen, setManageOpen] = useState(false);

  const roster = useAttendanceStore((s) => s.roster);
  const loading = useAttendanceStore((s) => s.loading);
  const fetchRoster = useAttendanceStore((s) => s.fetchRoster);
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

  return (
    <>
      <SectionHeader
        eyebrow="Workforce"
        title="Daily Attendance"
        actionSlot={
          <AdminOnly>
            <button
              type="button"
              onClick={() => setManageOpen(true)}
              className="shrink-0 rounded-lg border border-ink-faint/30 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep"
            >
              Manage workers
            </button>
          </AdminOnly>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-semibold text-ink">Date</label>
          <DatePicker id="date" value={date} onChange={setDate} max={todayStr()} className="w-64" />
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
                <th className="px-3 py-3 font-semibold">Time period</th>
                <th className="px-6 py-3 text-right font-semibold">Mark</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <RosterRow key={r.workerId} row={r} />
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

function RosterRow({ row }: { row: AttendanceRosterRow }) {
  const toast = useToast();
  const isAdmin = useIsAdmin();
  const mark = useAttendanceStore((s) => s.mark);
  const saving = useAttendanceStore((s) => !!s.saving[row.workerId]);

  const [from, setFrom] = useState(row.checkIn ?? '');
  const [to, setTo] = useState(row.checkOut ?? '');

  // Re-sync local time inputs when the roster (date) changes underneath.
  useEffect(() => {
    setFrom(row.checkIn ?? '');
    setTo(row.checkOut ?? '');
  }, [row.checkIn, row.checkOut, row.workerId]);

  const hasPeriod = !!(from && to);
  const hours = durationHours(from, to);

  async function save(status: Status, inT: string, outT: string) {
    try {
      await mark(row.workerId, status, inT || null, outT || null);
    } catch {
      toast('Failed to mark attendance', 'error');
    }
  }

  function onStatus(status: Status) {
    if (status === 'ABSENT') {
      // Absent needs no time period — clear it.
      setFrom('');
      setTo('');
      save(status, '', '');
      return;
    }
    // Present / Half-day require a time period first.
    if (!hasPeriod) {
      toast('Enter the time period first', 'error');
      return;
    }
    save(status, from, to);
  }

  function onTime(which: 'from' | 'to', val: string) {
    const nextFrom = which === 'from' ? val : from;
    const nextTo = which === 'to' ? val : to;
    if (which === 'from') setFrom(val);
    else setTo(val);
    // If already Present/Half and both times still set, keep the mark in sync.
    if ((row.status === 'PRESENT' || row.status === 'HALF_DAY') && nextFrom && nextTo) {
      save(row.status as Status, nextFrom, nextTo);
    }
  }

  return (
    <tr className="border-t border-ink-faint/10 hover:bg-paper-deep/20">
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kraft/15 font-display text-sm text-kraft-dark">
            {row.name.trim().charAt(0).toUpperCase()}
          </span>
          <span className="font-medium text-ink">{row.name}</span>
        </div>
      </td>
      <td className="px-3 py-3.5 text-ink-soft">{row.role ?? '—'}</td>

      <td className="px-3 py-3.5">
        <div className="inline-flex items-center gap-2 rounded-lg border border-kraft/30 bg-kraft/5 px-2.5 py-1.5">
          <ClockIcon />
          <input
            type="time"
            value={from}
            onChange={(e) => onTime('from', e.target.value)}
            disabled={!isAdmin}
            aria-label="Check in"
            className="w-[5.5rem] bg-transparent text-sm tabular-nums text-ink outline-none disabled:opacity-60"
          />
          <span className="text-ink-faint">–</span>
          <input
            type="time"
            value={to}
            onChange={(e) => onTime('to', e.target.value)}
            disabled={!isAdmin}
            aria-label="Check out"
            className="w-[5.5rem] bg-transparent text-sm tabular-nums text-ink outline-none disabled:opacity-60"
          />
          {hours ? (
            <span className="ml-1 rounded-full bg-pine/10 px-2 py-0.5 text-xs font-semibold text-pine">{hours}h</span>
          ) : null}
        </div>
        {from && to ? (
          <p className="mt-1 pl-1 text-xs text-ink-faint">{fmt12(from)} → {fmt12(to)}</p>
        ) : (
          <p className="mt-1 pl-1 text-xs text-ink-faint">Set time to mark present</p>
        )}
      </td>

      <td className="px-6 py-3.5">
        {!isAdmin ? (
          <div className="flex justify-end">
            <span className="rounded-full bg-paper-deep px-3 py-1 text-xs font-semibold text-ink-soft">
              {row.status ?? 'Not marked'}
            </span>
          </div>
        ) : (
        <div className="flex justify-end">
          <div className="inline-flex overflow-hidden rounded-lg border border-ink-faint/20">
            {OPTIONS.map((opt, i) => {
              const active = row.status === opt.value;
              // Present/Half need a time period; Absent always allowed.
              const blocked = opt.value !== 'ABSENT' && !hasPeriod;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={saving || blocked}
                  title={blocked ? 'Enter the time period first' : undefined}
                  onClick={() => onStatus(opt.value)}
                  className={`h-9 w-10 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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
        )}
      </td>
    </tr>
  );
}

