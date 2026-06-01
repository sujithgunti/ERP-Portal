'use client';

import { useEffect, useState } from 'react';
import { useExpensesStore } from '@/lib/store/expenses-store';
import { SectionHeader, EmptyState, inr } from '@/components/admin/ui';
import { NewPeriodButton, MONTHS } from '@/components/admin/expense-period-form';
import { ManagePeriodModal } from '@/components/admin/expense-items-editor';

export default function ExpensesPage() {
  const periods = useExpensesStore((s) => s.periods);
  const loading = useExpensesStore((s) => s.periodsLoading);
  const fetchPeriods = useExpensesStore((s) => s.fetchPeriods);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return (
    <>
      <SectionHeader
        eyebrow="Factory Overheads"
        title="Monthly Expenses"
        actionSlot={<NewPeriodButton />}
      />

      {loading && periods.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint">Loading expenses…</p>
      ) : periods.length === 0 ? (
        <EmptyState
          title="No expense months yet"
          hint="Add a month and log overheads (EB, labour, rent…) to compute cost per bag."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className="rounded-2xl border border-ink-faint/15 bg-paper-card p-5 text-left shadow-card transition-colors hover:border-kraft/40"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-xl text-pine">{MONTHS[p.month - 1]} {p.year}</p>
                <span className="text-xs text-ink-faint">{p.itemCount} item{p.itemCount === 1 ? '' : 's'}</span>
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Total expense</dt>
                  <dd className="font-medium tabular-nums text-ink">{inr(p.totalExpense)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Bags produced</dt>
                  <dd className="font-medium tabular-nums text-ink">{p.totalBagsProduced.toLocaleString('en-IN')}</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-lg bg-paper-deep/30 px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Overhead / bag</p>
                <p className="mt-0.5 font-display text-2xl text-kraft-dark">{inr(p.overheadPerBag, 4)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <ManagePeriodModal periodId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
