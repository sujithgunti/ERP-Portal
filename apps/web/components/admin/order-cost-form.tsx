'use client';

import { useEffect, useState } from 'react';
import type { OrderCostBreakdown, MaterialLineDto } from '@/lib/types';
import { Card, inr } from '@/components/admin/ui';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/lib/store/ui-store';
import { useCostingStore } from '@/lib/store/costing-store';
import { useExpensesStore } from '@/lib/store/expenses-store';
import { MONTHS } from '@/components/admin/expense-period-form';

export function OrderCostCard({ orderId }: { orderId: string }) {
  const data = useCostingStore((s) => s.byOrder[orderId] ?? null);
  const loading = useCostingStore((s) => s.loading[orderId] ?? false);
  const fetchCost = useCostingStore((s) => s.fetchCost);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchCost(orderId);
  }, [orderId, fetchCost]);

  return (
    <Card className="mb-6 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg text-pine">Cost breakdown</h2>
          <p className="text-sm text-ink-soft">Material + overhead per bag × quantity.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-ink-faint/30 px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep"
        >
          Edit cost
        </button>
      </div>

      {loading && !data ? (
        <p className="py-8 text-center text-sm text-ink-faint">Loading cost…</p>
      ) : !data ? (
        <p className="py-8 text-center text-sm text-ink-faint">No cost data.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Material lines */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Material / bag</p>
            {data.materialLines.length === 0 ? (
              <p className="text-sm text-ink-faint">No material lines. Click “Edit cost” to add paper, handle, printing…</p>
            ) : (
              <dl className="space-y-1.5 text-sm">
                {data.materialLines.map((l) => (
                  <div key={l.id} className="flex justify-between border-b border-ink-faint/10 pb-1.5">
                    <dt className="text-ink-soft">{l.name}</dt>
                    <dd className="tabular-nums text-ink">{inr(l.costPerBag, 4)}</dd>
                  </div>
                ))}
                <div className="flex justify-between pt-1 font-semibold">
                  <dt className="text-ink">Material subtotal</dt>
                  <dd className="tabular-nums text-ink">{inr(data.materialPerBag, 4)}</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-3 rounded-xl bg-paper-deep/25 p-5">
            <Row label="Material / bag" value={inr(data.materialPerBag, 4)} />
            <Row
              label={
                data.overheadPeriod
                  ? `Overhead / bag (${MONTHS[data.overheadPeriod.month - 1]} ${data.overheadPeriod.year})`
                  : 'Overhead / bag'
              }
              value={data.overheadPeriod ? inr(data.overheadPerBag, 4) : '— no month'}
            />
            <div className="flex items-center justify-between border-t border-ink-faint/15 pt-3">
              <span className="text-sm font-semibold text-ink">Cost / bag</span>
              <span className="font-display text-2xl text-pine">{inr(data.costPerBag, 4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">× {data.quantity.toLocaleString('en-IN')} bags</span>
              <span className="font-display text-2xl text-kraft-dark">{inr(data.totalCost)}</span>
            </div>

            {data.sellingPricePerBag != null ? (
              <div className="mt-2 space-y-1.5 border-t border-ink-faint/15 pt-3 text-sm">
                <Row label="Selling price / bag" value={inr(data.sellingPricePerBag, 4)} />
                <Row
                  label="Margin / bag"
                  value={inr(data.marginPerBag ?? 0, 4)}
                  accent={(data.marginPerBag ?? 0) >= 0 ? 'pos' : 'neg'}
                />
                <Row
                  label={`Total margin${data.marginPct != null ? ` (${data.marginPct.toFixed(1)}%)` : ''}`}
                  value={inr(data.totalMargin ?? 0)}
                  accent={(data.totalMargin ?? 0) >= 0 ? 'pos' : 'neg'}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} size="2xl" title="Edit cost" subtitle="Set material lines, pick the overhead month, and an optional selling price.">
        {data ? (
          <CostForm
            orderId={orderId}
            breakdown={data}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        ) : null}
      </Modal>
    </Card>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: 'pos' | 'neg' }) {
  const color = accent === 'pos' ? 'text-emerald-700' : accent === 'neg' ? 'text-red-700' : 'text-ink';
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className={`tabular-nums font-medium ${color}`}>{value}</span>
    </div>
  );
}

function CostForm({
  orderId,
  breakdown,
  onCancel,
  onSaved,
}: {
  orderId: string;
  breakdown: OrderCostBreakdown;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const periods = useExpensesStore((s) => s.periods);
  const fetchPeriods = useExpensesStore((s) => s.fetchPeriods);
  const setCost = useCostingStore((s) => s.setCost);
  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);
  const [lines, setLines] = useState<MaterialLineDto[]>(
    breakdown.materialLines.length > 0
      ? breakdown.materialLines.map((l) => ({ name: l.name, costPerBag: l.costPerBag }))
      : [{ name: '', costPerBag: 0 }],
  );
  const [overheadPeriodId, setOverheadPeriodId] = useState<string>(breakdown.overheadPeriodId ?? '');
  const [sellingPrice, setSellingPrice] = useState<string>(
    breakdown.sellingPricePerBag != null ? String(breakdown.sellingPricePerBag) : '',
  );
  const [saving, setSaving] = useState(false);

  const materialPerBag = lines.reduce((sum, l) => sum + (Number(l.costPerBag) || 0), 0);

  function setLine(i: number, patch: Partial<MaterialLineDto>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, { name: '', costPerBag: 0 }]);
  }
  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    const cleaned = lines
      .map((l) => ({ name: l.name.trim(), costPerBag: Number(l.costPerBag) || 0 }))
      .filter((l) => l.name.length > 0);

    setSaving(true);
    try {
      await setCost(orderId, {
        overheadPeriodId: overheadPeriodId || null,
        sellingPricePerBag: sellingPrice.trim() ? Number(sellingPrice) : null,
        materialLines: cleaned,
      });
      toast('Cost saved', 'success');
      onSaved();
    } catch {
      toast('Failed to save cost', 'error');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Material lines (₹ / bag)</p>
          <p className="text-sm text-ink-soft">Subtotal: <span className="font-semibold text-ink">{inr(materialPerBag, 4)}</span></p>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={l.name}
                onChange={(e) => setLine(i, { name: e.target.value })}
                placeholder="Paper / Handle / Printing"
                className="field flex-1"
              />
              <input
                type="number"
                min={0}
                step="0.0001"
                value={l.costPerBag}
                onChange={(e) => setLine(i, { costPerBag: Number(e.target.value) })}
                placeholder="0.00"
                className="field w-32"
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="rounded-md px-2 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                aria-label="Remove line"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLine} className="mt-2 text-sm font-semibold text-pine-moss hover:text-pine">
          + Add line
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ohm" className="block text-sm font-semibold text-ink">Overhead month</label>
          <select id="ohm" value={overheadPeriodId} onChange={(e) => setOverheadPeriodId(e.target.value)} className="field">
            <option value="">— none —</option>
            {(periods ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {MONTHS[p.month - 1]} {p.year} ({inr(p.overheadPerBag, 2)}/bag)
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="sell" className="block text-sm font-semibold text-ink">
            Selling price / bag <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <input id="sell" type="number" min={0} step="0.0001" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="field" placeholder="e.g. 15" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-pine px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save cost'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
      </div>
    </div>
  );
}
