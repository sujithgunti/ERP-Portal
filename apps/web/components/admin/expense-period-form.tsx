'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { ErrorNote, SubmitButton } from '@/components/auth-fields';
import { useToast } from '@/lib/store/ui-store';
import { useExpensesStore } from '@/lib/store/expenses-store';
import { ApiError } from '@/lib/api';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function NewPeriodForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const now = new Date();
  const createPeriod = useExpensesStore((s) => s.createPeriod);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const month = Number(form.get('month'));
    const year = Number(form.get('year'));
    const totalBagsProduced = Number(form.get('totalBagsProduced') ?? 0);
    const note = String(form.get('note') ?? '').trim();

    if (!month || month < 1 || month > 12) return setError('Pick a valid month.');
    if (!year || year < 2000) return setError('Enter a valid year.');
    if (!Number.isFinite(totalBagsProduced) || totalBagsProduced < 0)
      return setError('Bags produced must be 0 or more.');

    setPending(true);
    try {
      await createPeriod({ month, year, totalBagsProduced, note: note || undefined });
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setError('That month already exists.');
      else if (err instanceof ApiError && err.status === 403) setError('Not permitted.');
      else setError('Failed to create month.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="month" className="block text-sm font-semibold text-ink">Month</label>
          <select id="month" name="month" defaultValue={now.getMonth() + 1} className="field">
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="year" className="block text-sm font-semibold text-ink">Year</label>
          <input id="year" name="year" type="number" min={2000} max={2100} defaultValue={now.getFullYear()} required className="field" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="totalBagsProduced" className="block text-sm font-semibold text-ink">
          Bags produced this month
        </label>
        <input id="totalBagsProduced" name="totalBagsProduced" type="number" min={0} defaultValue={0} className="field" placeholder="100000" />
        <p className="text-xs text-ink-faint">Overheads are divided by this to get cost per bag.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="note" className="block text-sm font-semibold text-ink">
          Note <span className="font-normal text-ink-faint">(optional)</span>
        </label>
        <input id="note" name="note" className="field" placeholder="e.g. festive season ramp-up" />
      </div>

      <ErrorNote message={error} />
      <div className="flex items-center gap-3">
        <div className="w-44">
          <SubmitButton idleLabel="Create month" busyLabel="Creating…" pending={pending} />
        </div>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
      </div>
    </form>
  );
}

export function NewPeriodButton() {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
      >
        + New month
      </button>
      <Modal open={open} onClose={() => setOpen(false)} size="md" title="New expense month" subtitle="Start a monthly ledger of factory overheads.">
        <NewPeriodForm
          onCancel={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            toast('Expense month created', 'success');
          }}
        />
      </Modal>
    </>
  );
}
