'use client';

import { useEffect, useState } from 'react';
import { EXPENSE_CATEGORIES } from '@erp/types';
import type { ExpenseCategory, ExpensePeriodRow } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/lib/store/ui-store';
import { useExpensesStore } from '@/lib/store/expenses-store';
import { inr, titleCase } from '@/components/admin/ui';
import { MONTHS } from '@/components/admin/expense-period-form';

export function ManagePeriodModal({
  periodId,
  onClose,
}: {
  periodId: string | null;
  onClose: () => void;
}) {
  return (
    <Modal open={periodId !== null} onClose={onClose} size="2xl" title="Monthly expense ledger">
      {periodId ? <PeriodEditor periodId={periodId} /> : null}
    </Modal>
  );
}

function PeriodEditor({ periodId }: { periodId: string }) {
  const toast = useToast();
  const data = useExpensesStore((s) => s.current);
  const loading = useExpensesStore((s) => s.currentLoading);
  const fetchPeriod = useExpensesStore((s) => s.fetchPeriod);
  const clearCurrent = useExpensesStore((s) => s.clearCurrent);
  const removeItem = useExpensesStore((s) => s.removeItem);

  useEffect(() => {
    fetchPeriod(periodId);
    return () => clearCurrent();
  }, [periodId, fetchPeriod, clearCurrent]);

  // Showing a different period while the new one loads — guard on id match.
  const period = data && data.id === periodId ? data : null;

  if (loading && !period) return <p className="py-10 text-center text-sm text-ink-faint">Loading…</p>;
  if (!period) return <p className="py-10 text-center text-sm text-ink-faint">Not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kraft-dark">Period</p>
          <p className="mt-1 font-display text-2xl text-pine">{MONTHS[period.month - 1]} {period.year}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Overhead / bag</p>
          <p className="mt-1 font-display text-2xl text-kraft-dark">{inr(period.overheadPerBag, 4)}</p>
        </div>
      </div>

      <BagsEditor period={period} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Expense items</h3>
          <p className="text-sm text-ink-soft">Total: <span className="font-semibold text-ink">{inr(period.totalExpense)}</span></p>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink-faint/15">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Category</th>
                <th className="px-3 py-2.5 font-semibold">Note</th>
                <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                <th className="px-4 py-2.5 text-right font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {(period.items ?? []).length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-faint">No items yet.</td></tr>
              ) : (
                period.items!.map((it) => (
                  <tr key={it.id} className="border-t border-ink-faint/10">
                    <td className="px-4 py-3 font-medium text-ink">{titleCase(it.category)}</td>
                    <td className="px-3 py-3 text-ink-soft">{it.note ?? '—'}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink">{inr(it.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await removeItem(it.id, periodId);
                            toast('Item removed', 'success');
                          } catch {
                            toast('Failed to remove item', 'error');
                          }
                        }}
                        className="text-xs font-medium text-red-700 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddItemRow periodId={periodId} />
    </div>
  );
}

function BagsEditor({ period }: { period: ExpensePeriodRow }) {
  const toast = useToast();
  const updateBags = useExpensesStore((s) => s.updateBags);
  const [bags, setBags] = useState(String(period.totalBagsProduced));
  const [saving, setSaving] = useState(false);
  const dirty = Number(bags) !== period.totalBagsProduced;

  async function save() {
    const n = Number(bags);
    if (!Number.isFinite(n) || n < 0) return toast('Enter a valid number', 'error');
    setSaving(true);
    try {
      await updateBags(period.id, n);
      toast('Bags updated', 'success');
    } catch {
      toast('Failed to update', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-end gap-3 rounded-xl border border-ink-faint/15 bg-paper-deep/20 p-4">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="bags" className="block text-sm font-semibold text-ink">Bags produced this month</label>
        <input id="bags" type="number" min={0} value={bags} onChange={(e) => setBags(e.target.value)} className="field" />
      </div>
      <button
        type="button"
        onClick={save}
        disabled={!dirty || saving}
        className="rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}

function AddItemRow({ periodId }: { periodId: string }) {
  const toast = useToast();
  const addItem = useExpensesStore((s) => s.addItem);
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);

  async function add() {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) return toast('Enter a valid amount', 'error');
    setAdding(true);
    try {
      await addItem(periodId, { category, amount: amt, note: note.trim() || undefined });
      setAmount('');
      setNote('');
      toast('Item added', 'success');
    } catch {
      toast('Failed to add item', 'error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-ink-faint/30 p-4">
      <p className="text-sm font-semibold text-ink">Add expense</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="cat" className="block text-xs font-medium text-ink-soft">Category</label>
          <select id="cat" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="field">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{titleCase(c)}</option>
            ))}
          </select>
        </div>
        <div className="w-36 space-y-1.5">
          <label htmlFor="amt" className="block text-xs font-medium text-ink-soft">Amount (₹)</label>
          <input id="amt" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="field" placeholder="90000" />
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="inote" className="block text-xs font-medium text-ink-soft">Note (optional)</label>
          <input id="inote" value={note} onChange={(e) => setNote(e.target.value)} className="field" />
        </div>
        <button
          type="button"
          onClick={add}
          disabled={adding}
          className="rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </div>
    </div>
  );
}
