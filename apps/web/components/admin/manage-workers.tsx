'use client';

import { useState } from 'react';
import type { WorkerRow } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/lib/store/ui-store';
import { useWorkersStore } from '@/lib/store/workers-store';
import { ApiError } from '@/lib/api';

function WorkerForm({
  worker,
  mode,
  onDone,
  onCancel,
}: {
  worker?: WorkerRow;
  mode: 'create' | 'edit';
  onDone: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const createWorker = useWorkersStore((s) => s.createWorker);
  const updateWorker = useWorkersStore((s) => s.updateWorker);
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const phone = String(form.get('phone') ?? '').trim();
    const role = String(form.get('role') ?? '').trim();
    if (!name) return setError('Name is required.');

    const payload = { name, phone: phone || undefined, role: role || undefined };
    setPending(true);
    try {
      if (mode === 'edit' && worker) await updateWorker(worker.id, payload);
      else await createWorker(payload);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? 'Not permitted.' : 'Failed to save worker.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-dashed border-ink-faint/30 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input name="name" defaultValue={worker?.name} placeholder="Worker name" className="field" />
        <input name="phone" defaultValue={worker?.phone ?? undefined} placeholder="Phone (optional)" className="field" />
        <input name="role" defaultValue={worker?.role ?? undefined} placeholder="Role e.g. Ladies work" className="field" />
      </div>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-paper hover:bg-pine-deep disabled:opacity-60">
          {pending ? 'Saving…' : mode === 'edit' ? 'Save' : 'Add worker'}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
      </div>
    </form>
  );
}

export function ManageWorkersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const workers = useWorkersStore((s) => s.workers);
  const updateWorker = useWorkersStore((s) => s.updateWorker);
  const removeWorker = useWorkersStore((s) => s.removeWorker);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function toggleActive(w: WorkerRow) {
    try {
      await updateWorker(w.id, { active: !w.active });
      toast(w.active ? 'Worker deactivated' : 'Worker reactivated', 'success');
    } catch {
      toast('Failed to update', 'error');
    }
  }

  async function del(w: WorkerRow) {
    try {
      await removeWorker(w.id);
      toast('Worker deleted', 'success');
    } catch {
      toast('Failed to delete', 'error');
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="2xl" title="Manage workers" subtitle="Add, edit, deactivate or remove factory workers.">
      <div className="space-y-4">
        {adding ? (
          <WorkerForm mode="create" onCancel={() => setAdding(false)} onDone={() => { setAdding(false); toast('Worker added', 'success'); }} />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="text-sm font-semibold text-pine-moss hover:text-pine">
            + Add worker
          </button>
        )}

        <div className="overflow-hidden rounded-xl border border-ink-faint/15">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Role</th>
                <th className="px-3 py-2.5 font-semibold">Phone</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold"> </th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-faint">No workers yet.</td></tr>
              ) : (
                workers.map((w) =>
                  editingId === w.id ? (
                    <tr key={w.id}><td colSpan={5} className="px-4 py-3">
                      <WorkerForm mode="edit" worker={w} onCancel={() => setEditingId(null)} onDone={() => { setEditingId(null); toast('Worker updated', 'success'); }} />
                    </td></tr>
                  ) : (
                    <tr key={w.id} className={`border-t border-ink-faint/10 ${w.active ? '' : 'opacity-50'}`}>
                      <td className="px-4 py-3 font-medium text-ink">{w.name}</td>
                      <td className="px-3 py-3 text-ink-soft">{w.role ?? '—'}</td>
                      <td className="px-3 py-3 text-ink-soft">{w.phone ?? '—'}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${w.active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-faint/10 text-ink-faint'}`}>
                          {w.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        <button type="button" onClick={() => setEditingId(w.id)} className="font-medium text-ink-soft hover:text-ink">Edit</button>
                        <button type="button" onClick={() => toggleActive(w)} className="ml-3 font-medium text-amber-700 hover:text-amber-800">{w.active ? 'Deactivate' : 'Activate'}</button>
                        <button type="button" onClick={() => del(w)} className="ml-3 font-medium text-red-700 hover:text-red-800">Delete</button>
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
