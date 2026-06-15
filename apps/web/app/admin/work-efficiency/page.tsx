'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MachineProductionRosterRow } from '@/lib/types';
import { SectionHeader, EmptyState, StatCard } from '@/components/admin/ui';
import { useToast } from '@/lib/store/ui-store';
import { useMachinesStore } from '@/lib/store/machines-store';
import { ManageMachinesModal } from '@/components/admin/manage-machines';
import { DatePicker } from '@/components/ui/date-picker';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkEfficiencyPage() {
  const date = useMachinesStore((s) => s.date);
  const setDate = useMachinesStore((s) => s.setDate);
  const roster = useMachinesStore((s) => s.roster);
  const loading = useMachinesStore((s) => s.rosterLoading);
  const fetchMachines = useMachinesStore((s) => s.fetchMachines);
  const fetchRoster = useMachinesStore((s) => s.fetchRoster);
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    fetchMachines();
    fetchRoster(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalBags = useMemo(
    () => roster.reduce((s, r) => s + (r.bagsProduced ?? 0), 0),
    [roster],
  );
  const machinesRun = useMemo(
    () => roster.filter((r) => (r.bagsProduced ?? 0) > 0).length,
    [roster],
  );

  return (
    <>
      <SectionHeader
        eyebrow="Production"
        title="Work Efficiency"
        actionSlot={
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
          >
            + Add machines
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="space-y-1.5">
          <label htmlFor="date" className="block text-sm font-semibold text-ink">Date</label>
          <DatePicker id="date" value={date} onChange={setDate} max={todayStr()} className="w-64" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Bags produced (day)" value={totalBags.toLocaleString('en-IN')} accent />
        <StatCard label="Machines run" value={machinesRun} />
        <StatCard label="Machines" value={roster.length} />
      </div>

      {loading && roster.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint">Loading…</p>
      ) : roster.length === 0 ? (
        <EmptyState title="No active machines" hint="Add machines via “Manage machines” to record daily output." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-faint/15 bg-paper-card shadow-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-6 py-3 font-semibold">Machine</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 text-right font-semibold">Bags produced</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <MachineRowEntry key={r.machineId} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ManageMachinesModal
        open={manageOpen}
        onClose={() => {
          setManageOpen(false);
          fetchRoster(date);
        }}
      />
    </>
  );
}

function MachineRowEntry({ row }: { row: MachineProductionRosterRow }) {
  const toast = useToast();
  const setProduction = useMachinesStore((s) => s.setProduction);
  const saving = useMachinesStore((s) => s.saving[row.machineId] ?? false);
  const [value, setValue] = useState<string>(row.bagsProduced != null ? String(row.bagsProduced) : '');

  // Keep input synced when the roster (date) changes underneath.
  useEffect(() => {
    setValue(row.bagsProduced != null ? String(row.bagsProduced) : '');
  }, [row.bagsProduced, row.machineId]);

  const dirty = (value === '' ? null : Number(value)) !== (row.bagsProduced ?? null);

  async function save() {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return toast('Enter a valid count', 'error');
    try {
      await setProduction(row.machineId, n);
      toast('Saved', 'success');
    } catch {
      toast('Failed to save', 'error');
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
      <td className="px-3 py-3.5 text-ink-soft">{row.type ?? '—'}</td>
      <td className="px-6 py-3.5">
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            className="field w-32 text-right"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep disabled:opacity-50"
          >
            {saving ? '…' : 'Save'}
          </button>
        </div>
      </td>
    </tr>
  );
}
