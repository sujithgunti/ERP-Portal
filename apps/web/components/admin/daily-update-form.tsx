'use client';

import { useState } from 'react';
import { PRODUCTION_STAGE_ORDER } from '@erp/types';
import type { ProductionStage } from '@erp/types';
import { ErrorNote, SubmitButton } from '@/components/auth-fields';
import { stageLabel } from '@/components/admin/ui';
import { prismaApi, ApiError } from '@/lib/api';

export function DailyUpdateForm({
  orderId,
  currentStage,
  onCancel,
  onSuccess,
}: {
  orderId: string;
  currentStage: ProductionStage;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const stage = String(form.get('stage') ?? '');
    const quantityCompleted = Number(form.get('quantityCompleted'));
    const quantityPending = Number(form.get('quantityPending'));
    const remarks = String(form.get('remarks') ?? '').trim();

    if (!stage) return setError('Stage is required.');
    if (!Number.isFinite(quantityCompleted) || quantityCompleted < 0) return setError('Completed must be 0 or more.');
    if (!Number.isFinite(quantityPending) || quantityPending < 0) return setError('Pending must be 0 or more.');

    setPending(true);
    try {
      await prismaApi('POST', `/orders/${orderId}/updates`, {
        stage,
        quantityCompleted,
        quantityPending,
        remarks: remarks || undefined,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? 'Not permitted.' : 'Failed to add update.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="stage" className="block text-sm font-semibold text-ink">Production stage</label>
        <select id="stage" name="stage" defaultValue={currentStage} className="field">
          {PRODUCTION_STAGE_ORDER.map((s) => (
            <option key={s} value={s}>{stageLabel(s)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="quantityCompleted" className="block text-sm font-semibold text-ink">Qty completed</label>
          <input id="quantityCompleted" name="quantityCompleted" type="number" min={0} defaultValue={0} required className="field" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="quantityPending" className="block text-sm font-semibold text-ink">Qty pending</label>
          <input id="quantityPending" name="quantityPending" type="number" min={0} defaultValue={0} required className="field" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="remarks" className="block text-sm font-semibold text-ink">
          Remarks <span className="font-normal text-ink-faint">(optional)</span>
        </label>
        <textarea id="remarks" name="remarks" rows={3} placeholder="Machine running, slight delay…" className="field resize-none" />
      </div>

      <ErrorNote message={error} />

      <div className="flex items-center gap-3">
        <div className="w-44">
          <SubmitButton idleLabel="Save update" busyLabel="Saving…" pending={pending} />
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
        ) : null}
      </div>
    </form>
  );
}
