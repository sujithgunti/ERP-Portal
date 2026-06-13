'use client';

import { useEffect, useState } from 'react';
import type { ExpenseDirection } from '@/lib/types';
import { useExpensesStore } from '@/lib/store/expenses-store';
import { useToast } from '@/lib/store/ui-store';
import { SectionHeader, EmptyState, StatCard, inr } from '@/components/admin/ui';
import { DatePicker } from '@/components/ui/date-picker';
import { DropdownOptionSelector } from '@/components/ui/select';

function isoToday(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function fmtDay(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ExpensesPage() {
  const days = useExpensesStore((s) => s.days);
  const loading = useExpensesStore((s) => s.loading);
  const fetchRecent = useExpensesStore((s) => s.fetchRecent);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const totals = days.reduce(
    (acc, d) => {
      acc.incoming += d.incoming;
      acc.outgoing += d.outgoing;
      return acc;
    },
    { incoming: 0, outgoing: 0 },
  );

  return (
    <>
      <SectionHeader eyebrow="Daily Cash Book" title="Expenses" actionSlot={<AddEntryButton />} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total incoming" value={inr(totals.incoming)} />
        <StatCard label="Total outgoing" value={inr(totals.outgoing)} accent />
        <StatCard label="Net" value={inr(totals.incoming - totals.outgoing)} />
      </div>

      {loading && days.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint">Loading…</p>
      ) : days.length === 0 ? (
        <EmptyState title="No entries yet" hint="Add the day's incoming and outgoing cash to start tracking." />
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <DayCard key={day.date} day={day} />
          ))}
        </div>
      )}
    </>
  );
}

function DayCard({ day }: { day: import('@/lib/types').DailyExpenseDay }) {
  const removeEntry = useExpensesStore((s) => s.removeEntry);
  const toast = useToast();

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-faint/15 bg-paper-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-faint/12 px-6 py-4">
        <p className="font-display text-lg text-pine">{fmtDay(day.date)}</p>
        <div className="flex gap-4 text-sm">
          <span className="text-emerald-700">In {inr(day.incoming)}</span>
          <span className="text-red-700">Out {inr(day.outgoing)}</span>
          <span className={`font-semibold ${day.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            Net {inr(day.net)}
          </span>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <tbody>
          {day.entries.map((e) => (
            <tr key={e.id} className="border-t border-ink-faint/10">
              <td className="px-6 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    e.direction === 'INCOMING'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {e.direction === 'INCOMING' ? 'IN' : 'OUT'}
                </span>
              </td>
              <td className="px-3 py-3 font-medium text-ink">{e.category ?? '—'}</td>
              <td className="px-3 py-3 text-ink-soft">{e.note ?? ''}</td>
              <td className="px-3 py-3 text-right tabular-nums text-ink">{inr(e.amount)}</td>
              <td className="px-6 py-3 text-right">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await removeEntry(e.id);
                      toast('Entry removed', 'success');
                    } catch {
                      toast('Failed to remove', 'error');
                    }
                  }}
                  className="text-xs font-medium text-red-700 hover:text-red-800"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddEntryButton() {
  const toast = useToast();
  const addEntry = useExpensesStore((s) => s.addEntry);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
      >
        + Add entry
      </button>
      {open ? <EntryModal onClose={() => setOpen(false)} addEntry={addEntry} toast={toast} /> : null}
    </>
  );
}

function EntryModal({
  onClose,
  addEntry,
  toast,
}: {
  onClose: () => void;
  addEntry: (dto: {
    date: string;
    direction: ExpenseDirection;
    amount: number;
    category?: string;
    note?: string;
  }) => Promise<void>;
  toast: (m: string, v?: 'success' | 'error' | 'info') => void;
}) {
  const [date, setDate] = useState(isoToday());
  const [direction, setDirection] = useState<ExpenseDirection>('OUTGOING');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return toast('Enter a valid amount', 'error');
    setSaving(true);
    try {
      await addEntry({ date, direction, amount: amt, category: category.trim() || undefined, note: note.trim() || undefined });
      toast('Entry added', 'success');
      onClose();
    } catch {
      toast('Failed to add entry', 'error');
      setSaving(false);
    }
  }

  // Fixed overlay modal (lightweight; matches global modal feel).
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24" role="dialog">
      <div className="absolute inset-0 bg-pine-deep/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-paper-card p-6 shadow-card">
        <h2 className="font-display text-2xl text-pine">Add cash entry</h2>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="d" className="block text-sm font-semibold text-ink">Date</label>
              <DatePicker id="d" value={date} onChange={setDate} max={isoToday()} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="dir" className="block text-sm font-semibold text-ink">Direction</label>
              <DropdownOptionSelector
                id="dir"
                value={direction}
                onChange={(v) => setDirection(v as ExpenseDirection)}
                options={[
                  { value: 'OUTGOING', label: 'Outgoing' },
                  { value: 'INCOMING', label: 'Incoming' },
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="amt" className="block text-sm font-semibold text-ink">Amount (₹)</label>
              <input id="amt" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="field" placeholder="12000" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cat" className="block text-sm font-semibold text-ink">Category</label>
              <input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} className="field" placeholder="Paper / Labour / Advance" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="n" className="block text-sm font-semibold text-ink">Note (optional)</label>
            <input id="n" value={note} onChange={(e) => setNote(e.target.value)} className="field" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-pine px-5 py-2.5 text-sm font-semibold text-paper hover:bg-pine-deep disabled:opacity-60">
            {saving ? 'Saving…' : 'Add entry'}
          </button>
          <button type="button" onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
        </div>
      </div>
    </div>
  );
}
