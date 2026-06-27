'use client';

import { useState } from 'react';
import { PRODUCTION_STAGES } from '@erp/types';
import type { ProductionStage } from '@erp/types';
import { stageLabel, ProgressBar } from '@/components/admin/ui';
import { Check } from '@/components/icons';
import { useToast } from '@/lib/store/ui-store';
import { prismaApi, ApiError } from '@/lib/api';

/**
 * Independent per-stage checkbox tracker. Each stage can be completed on its own
 * (no forced order). Checking a stage opens an optional note; unchecking is
 * immediate. Completing every stage auto-delivers the order (handled by the API).
 */
export function StageChecklist({
  orderId,
  completedStages,
  delivered,
  onChanged,
}: {
  orderId: string;
  completedStages: ProductionStage[];
  delivered: boolean;
  onChanged: () => void;
}) {
  const toast = useToast();
  const done = new Set(completedStages);
  const completedCount = PRODUCTION_STAGES.filter((s) => done.has(s)).length;
  const pct = delivered ? 100 : Math.round((completedCount / PRODUCTION_STAGES.length) * 100);

  const [noteFor, setNoteFor] = useState<ProductionStage | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<ProductionStage | null>(null);

  async function setStage(stage: ProductionStage, completed: boolean, remarks?: string) {
    setBusy(stage);
    try {
      await prismaApi('PATCH', `/orders/${orderId}/stages`, { stage, completed, remarks: remarks || undefined });
      setNoteFor(null);
      setNote('');
      onChanged();
    } catch (err) {
      toast(err instanceof ApiError && err.status === 403 ? 'Not permitted.' : 'Failed to update stage.', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-pine">Production checklist</h2>
          <p className="text-sm text-ink-soft">
            Tick each stage as it&apos;s completed — in any order. {completedCount}/{PRODUCTION_STAGES.length} done.
          </p>
        </div>
        <span className="font-display text-3xl text-pine">{pct}%</span>
      </div>
      <ProgressBar value={pct} />

      <ul className="mt-5 space-y-1.5">
        {PRODUCTION_STAGES.map((stage) => {
          const checked = done.has(stage);
          const isBusy = busy === stage;
          const noting = noteFor === stage;
          return (
            <li key={stage} className="rounded-lg border border-ink-faint/12 bg-paper-card">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <button
                  type="button"
                  disabled={isBusy || delivered}
                  onClick={() => (checked ? setStage(stage, false) : setNoteFor(noting ? null : stage))}
                  aria-pressed={checked}
                  aria-label={`${checked ? 'Uncheck' : 'Check'} ${stageLabel(stage)}`}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors disabled:opacity-50 ${
                    checked
                      ? 'border-pine-moss bg-pine-moss text-paper'
                      : 'border-ink-faint/40 bg-paper hover:border-pine-moss'
                  }`}
                >
                  {checked ? <Check /> : null}
                </button>
                <span className={`flex-1 text-sm ${checked ? 'font-medium text-ink' : 'text-ink-soft'}`}>
                  {stageLabel(stage)}
                </span>
                {checked ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">done</span>
                ) : (
                  <button
                    type="button"
                    disabled={delivered}
                    onClick={() => setNoteFor(noting ? null : stage)}
                    className="text-xs font-semibold text-pine-moss hover:text-pine disabled:opacity-50"
                  >
                    {noting ? 'Cancel' : 'Mark done'}
                  </button>
                )}
              </div>

              {noting && !checked ? (
                <div className="border-t border-ink-faint/10 px-3 py-2.5">
                  <label className="block text-xs font-semibold text-ink-soft">
                    Note <span className="font-normal text-ink-faint">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. completed on second machine, slight delay…"
                    className="field mt-1 resize-none text-sm"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setStage(stage, true, note)}
                      className="rounded-lg bg-pine px-3.5 py-2 text-sm font-semibold text-paper hover:bg-pine-deep disabled:opacity-60"
                    >
                      {isBusy ? 'Saving…' : 'Mark complete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNoteFor(null); setNote(''); }}
                      className="text-sm font-medium text-ink-soft hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {delivered ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
          ✓ All stages complete — this order is marked Delivered.
        </p>
      ) : completedCount === PRODUCTION_STAGES.length ? null : (
        <p className="mt-4 text-xs text-ink-faint">Completing every stage will automatically mark the order Delivered.</p>
      )}
    </div>
  );
}
