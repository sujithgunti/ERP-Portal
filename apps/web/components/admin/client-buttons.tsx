'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Field, ErrorNote, SubmitButton } from '@/components/auth-fields';
import { useToast } from '@/lib/store/ui-store';
import { prismaApi, ApiError } from '@/lib/api';
import type { ClientRow } from '@/lib/types';

function ClientForm({
  client,
  mode,
  onSuccess,
  onCancel,
}: {
  client?: ClientRow;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const gstNumber = String(form.get('gstNumber') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    if (!name) return setError('Client name is required.');

    const payload = { name, gstNumber: gstNumber || undefined, phone: phone || undefined };
    setPending(true);
    try {
      if (mode === 'edit' && client) await prismaApi('PATCH', `/clients/${client.id}`, payload);
      else await prismaApi('POST', '/clients', payload);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? 'Not permitted.' : 'Failed to save client.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <Field id="name" label="Client name" placeholder="Taaza" defaultValue={client?.name} />
      <Field id="gstNumber" label="GST number (optional)" placeholder="29ABCDE1234F1Z5" required={false} defaultValue={client?.gstNumber ?? undefined} />
      <Field id="phone" label="Phone (optional)" placeholder="+91 98765 43210" required={false} defaultValue={client?.phone ?? undefined} />
      <ErrorNote message={error} />
      <div className="flex items-center gap-3">
        <div className="w-44">
          <SubmitButton idleLabel={mode === 'edit' ? 'Save changes' : 'Create client'} busyLabel={mode === 'edit' ? 'Saving…' : 'Creating…'} pending={pending} />
        </div>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
      </div>
    </form>
  );
}

export function NewClientButton({ onSaved }: { onSaved: () => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
      >
        + New client
      </button>
      <Modal open={open} onClose={() => setOpen(false)} size="md" title="New client">
        <ClientForm
          mode="create"
          onCancel={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            toast('Client created', 'success');
            onSaved();
          }}
        />
      </Modal>
    </>
  );
}

export function EditClientButton({ client, onSaved }: { client: ClientRow; onSaved: () => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-ink-faint/30 px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep"
      >
        Edit
      </button>
      <Modal open={open} onClose={() => setOpen(false)} size="md" title="Edit client">
        <ClientForm
          mode="edit"
          client={client}
          onCancel={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            toast('Client updated', 'success');
            onSaved();
          }}
        />
      </Modal>
    </>
  );
}
