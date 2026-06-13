'use client';

import { useState } from 'react';
import { Field, ErrorNote, SubmitButton } from '@/components/auth-fields';
import { DatePicker } from '@/components/ui/date-picker';
import { DropdownOptionSelector } from '@/components/ui/select';
import { prismaApi, ApiError } from '@/lib/api';
import type { ClientRow, OrderDetail } from '@/lib/types';

export function OrderForm({
  clients,
  order,
  mode = 'create',
  onCancel,
  onSuccess,
}: {
  clients?: ClientRow[];
  order?: OrderDetail;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);
  const [deadline, setDeadline] = useState(order?.deadline ? order.deadline.slice(0, 10) : '');
  const [clientId, setClientId] = useState(order?.client.id ?? '');
  const [priority, setPriority] = useState(order?.priority ?? 'MEDIUM');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);

    const name = String(form.get('name') ?? '').trim();
    const quantity = Number(form.get('quantity'));
    const deadline = String(form.get('deadline') ?? '');
    const priority = String(form.get('priority') ?? 'MEDIUM');
    const gsmRaw = String(form.get('gsm') ?? '').trim();

    if (mode === 'create' && !String(form.get('clientId') ?? '')) return setError('Select a client.');
    if (!name) return setError('Order name is required.');
    if (!Number.isFinite(quantity) || quantity < 1) return setError('Quantity must be at least 1.');
    if (!deadline) return setError('Deadline is required.');

    const specs = {
      name,
      quantity,
      deadline: new Date(deadline).toISOString(),
      priority,
      size: emptyToUndefined(form.get('size')),
      gsm: gsmRaw ? Number(gsmRaw) : undefined,
      printingType: emptyToUndefined(form.get('printingType')),
      handleType: emptyToUndefined(form.get('handleType')),
      lamination: form.get('lamination') === 'on',
      notes: emptyToUndefined(form.get('notes')),
    };

    setPending(true);
    try {
      if (mode === 'edit' && order) {
        await prismaApi('PATCH', `/orders/${order.id}`, specs);
      } else {
        await prismaApi('POST', '/orders', { ...specs, clientId: String(form.get('clientId')) });
      }
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setError('You do not have permission.');
      else if (err instanceof ApiError && err.status === 400) setError('Please check the form values.');
      else setError('Failed to save order. Please try again.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-6">
      <FieldGroup title="Order details">
        {mode === 'create' ? (
          <div className="space-y-1.5">
            <label htmlFor="clientId" className="block text-sm font-semibold text-ink">Client</label>
            <DropdownOptionSelector
              id="clientId"
              name="clientId"
              value={clientId}
              onChange={setClientId}
              placeholder="Select a client…"
              options={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <span className="block text-sm font-semibold text-ink">Client</span>
            <p className="rounded-lg border border-ink-faint/20 bg-paper-deep/40 px-4 py-3 text-sm text-ink-soft">
              {order?.client.name}
            </p>
          </div>
        )}

        <Field id="name" label="Order name" placeholder="Taaza Carry Bags" defaultValue={order?.name} />

        <div className="grid grid-cols-2 gap-4">
          <Field id="quantity" label="Quantity" type="number" placeholder="50000" defaultValue={order?.quantity} />
          <div className="space-y-1.5">
            <label htmlFor="deadline" className="block text-sm font-semibold text-ink">Deadline</label>
            <DatePicker id="deadline" value={deadline} onChange={setDeadline} placeholder="dd / mm / yyyy" />
            <input type="hidden" name="deadline" value={deadline} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="priority" className="block text-sm font-semibold text-ink">Priority</label>
          <DropdownOptionSelector
            id="priority"
            name="priority"
            value={priority}
            onChange={(v) => setPriority(v as typeof priority)}
            options={[
              { value: 'HIGH', label: 'High' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'LOW', label: 'Low' },
            ]}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Specifications">
        <div className="grid grid-cols-2 gap-4">
          <Field id="size" label="Size" placeholder="12 x 16" required={false} defaultValue={order?.size ?? undefined} />
          <Field id="gsm" label="GSM" type="number" placeholder="90" required={false} defaultValue={order?.gsm ?? undefined} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field id="printingType" label="Printing type" placeholder="Flexo" required={false} defaultValue={order?.printingType ?? undefined} />
          <Field id="handleType" label="Handle type" placeholder="Loop" required={false} defaultValue={order?.handleType ?? undefined} />
        </div>
        <label className="flex items-center gap-2.5 pt-1 text-sm text-ink">
          <input type="checkbox" name="lamination" defaultChecked={order?.lamination ?? false} className="h-4 w-4 rounded border-ink-faint/40 text-pine" />
          Requires lamination
        </label>
      </FieldGroup>

      <FieldGroup title="Additional notes">
        <div className="space-y-1.5">
          <label htmlFor="notes" className="block text-sm font-semibold text-ink">
            Notes / message <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Any extra instructions, client message, or context for this order…"
            defaultValue={order?.notes ?? undefined}
            className="field resize-y"
          />
        </div>
      </FieldGroup>

      <ErrorNote message={error} />

      <div className="flex items-center gap-3">
        <div className="w-44">
          <SubmitButton
            idleLabel={mode === 'edit' ? 'Save changes' : 'Create order'}
            busyLabel={mode === 'edit' ? 'Saving…' : 'Creating…'}
            pending={pending}
          />
        </div>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

function emptyToUndefined(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : s;
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-ink-faint/15 bg-paper-card p-6 shadow-card">
      <legend className="px-2 font-display text-base text-pine">{title}</legend>
      <div className="mt-2 space-y-4">{children}</div>
    </fieldset>
  );
}
