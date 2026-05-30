'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Field, ErrorNote, SubmitButton } from '@/components/auth-fields';
import { createClientAction, type ClientFormState } from '../actions';

export default function NewClientPage() {
  const [state, formAction] = useActionState<ClientFormState, FormData>(createClientAction, {});

  return (
    <>
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-kraft-dark">
          Client Management
        </p>
        <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-pine">New client</h1>
      </div>

      <form action={formAction} className="max-w-lg space-y-5">
        <fieldset className="space-y-4 rounded-2xl border border-ink-faint/15 bg-paper-card p-6 shadow-card">
          <Field id="name" label="Client name" placeholder="Taaza" />
          <Field id="contact" label="Contact (optional)" placeholder="orders@taaza.com" required={false} />
        </fieldset>

        <ErrorNote message={state.error} />

        <div className="flex items-center gap-3">
          <div className="w-44">
            <SubmitButton idleLabel="Create client" busyLabel="Creating…" />
          </div>
          <Link href="/admin/clients" className="text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
