'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Field, ErrorNote, SubmitButton } from '@/components/auth-fields';
import type { ClientRow } from '@/lib/types';
import { createOrderAction, type OrderFormState } from '@/app/admin/orders/actions';

export function OrderForm({ clients, onCancel }: { clients: ClientRow[]; onCancel?: () => void }) {
  const [state, formAction] = useActionState<OrderFormState, FormData>(createOrderAction, {});

  return (
    <form action={formAction} className="w-full space-y-6">
      <FieldGroup title="Order details">
        <div className="space-y-1.5">
          <label htmlFor="clientId" className="block text-[13px] font-semibold text-ink">
            Client
          </label>
          <select id="clientId" name="clientId" required defaultValue="" className="field">
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {clients.length === 0 ? (
            <p className="text-xs text-ink-faint">
              No clients yet —{' '}
              <Link href="/admin/clients/new" className="font-semibold text-pine underline">
                add one first
              </Link>
              .
            </p>
          ) : null}
        </div>

        <Field id="name" label="Order name" placeholder="Taaza Carry Bags" />

        <div className="grid grid-cols-2 gap-4">
          <Field id="quantity" label="Quantity" type="number" placeholder="50000" />
          <Field id="deadline" label="Deadline" type="date" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="priority" className="block text-[13px] font-semibold text-ink">
            Priority
          </label>
          <select id="priority" name="priority" defaultValue="MEDIUM" className="field">
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </FieldGroup>

      <FieldGroup title="Specifications">
        <div className="grid grid-cols-2 gap-4">
          <Field id="size" label="Size" placeholder="12 x 16" required={false} />
          <Field id="gsm" label="GSM" type="number" placeholder="90" required={false} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field id="printingType" label="Printing type" placeholder="Flexo" required={false} />
          <Field id="handleType" label="Handle type" placeholder="Loop" required={false} />
        </div>
        <label className="flex items-center gap-2.5 pt-1 text-sm text-ink">
          <input type="checkbox" name="lamination" className="h-4 w-4 rounded border-ink-faint/40 text-pine" />
          Requires lamination
        </label>
      </FieldGroup>

      <ErrorNote message={state.error} />

      <div className="flex items-center gap-3">
        <div className="w-44">
          <SubmitButton idleLabel="Create order" busyLabel="Creating…" />
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            Cancel
          </button>
        ) : (
          <Link href="/admin/orders" className="text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-ink-faint/15 bg-paper-card p-6 shadow-card">
      <legend className="px-2 font-display text-base text-pine">{title}</legend>
      <div className="mt-2 space-y-4">{children}</div>
    </fieldset>
  );
}
