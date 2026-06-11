'use client';

import { useState } from 'react';
import type { MachineRow } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/lib/store/ui-store';
import { useMachinesStore } from '@/lib/store/machines-store';
import { ApiError } from '@/lib/api';

function MachineForm({
  machine,
  mode,
  onDone,
  onCancel,
}: {
  machine?: MachineRow;
  mode: 'create' | 'edit';
  onDone: () => void;
  onCancel: () => void;
}) {
  const createMachine = useMachinesStore((s) => s.createMachine);
  const updateMachine = useMachinesStore((s) => s.updateMachine);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const type = String(form.get('type') ?? '').trim();
    if (!name) return setError('Name is required.');

    const payload = { name, type: type || undefined };
    setPending(true);
    try {
      if (mode === 'edit' && machine) await updateMachine(machine.id, payload);
      else await createMachine(payload);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? 'Not permitted.' : 'Failed to save machine.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-dashed border-ink-faint/30 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="name" defaultValue={machine?.name} placeholder="Machine name e.g. Punching M1" className="field" />
        <input name="type" defaultValue={machine?.type ?? undefined} placeholder="Type (optional) e.g. Punching" className="field" />
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-paper hover:bg-pine-deep disabled:opacity-60">
          {pending ? 'Saving…' : mode === 'edit' ? 'Save' : 'Add machine'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
      </div>
    </form>
  );
}

export function ManageMachinesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const machines = useMachinesStore((s) => s.machines);
  const updateMachine = useMachinesStore((s) => s.updateMachine);
  const removeMachine = useMachinesStore((s) => s.removeMachine);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function toggleActive(m: MachineRow) {
    try {
      await updateMachine(m.id, { active: !m.active });
      toast(m.active ? 'Machine deactivated' : 'Machine reactivated', 'success');
    } catch {
      toast('Failed to update', 'error');
    }
  }

  async function del(m: MachineRow) {
    try {
      await removeMachine(m.id);
      toast('Machine deleted', 'success');
    } catch {
      toast('Failed to delete', 'error');
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="2xl" title="Manage machines" subtitle="Add, edit, deactivate or remove production machines.">
      <div className="space-y-4">
        {adding ? (
          <MachineForm mode="create" onCancel={() => setAdding(false)} onDone={() => { setAdding(false); toast('Machine added', 'success'); }} />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="text-sm font-semibold text-pine-moss hover:text-pine">
            + Add machine
          </button>
        )}

        <div className="overflow-hidden rounded-xl border border-ink-faint/15">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {machines.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-ink-faint">No machines yet.</td></tr>
              ) : (
                machines.map((m) =>
                  editingId === m.id ? (
                    <tr key={m.id}><td colSpan={4} className="px-4 py-3">
                      <MachineForm mode="edit" machine={m} onCancel={() => setEditingId(null)} onDone={() => { setEditingId(null); toast('Machine updated', 'success'); }} />
                    </td></tr>
                  ) : (
                    <tr key={m.id} className={`border-t border-ink-faint/10 ${m.active ? '' : 'opacity-50'}`}>
                      <td className="px-4 py-3 font-medium text-ink">{m.name}</td>
                      <td className="px-3 py-3 text-ink-soft">{m.type ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-faint/10 text-ink-faint'}`}>
                          {m.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        <button type="button" onClick={() => setEditingId(m.id)} className="font-medium text-ink-soft hover:text-ink">Edit</button>
                        <button type="button" onClick={() => toggleActive(m)} className="ml-3 font-medium text-amber-700 hover:text-amber-800">{m.active ? 'Deactivate' : 'Activate'}</button>
                        <button type="button" onClick={() => del(m)} className="ml-3 font-medium text-red-700 hover:text-red-800">Delete</button>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
