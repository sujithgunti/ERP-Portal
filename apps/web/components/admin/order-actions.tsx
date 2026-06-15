'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { OrderForm } from '@/components/admin/order-form';
import { useToast } from '@/lib/store/ui-store';
import { prismaApi } from '@/lib/api';
import type { OrderDetail } from '@/lib/types';

export function OrderActions({ order, onChanged }: { order: OrderDetail; onChanged: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      await prismaApi('DELETE', `/orders/${order.id}`);
      toast('Order deleted', 'success');
      router.push('/admin/orders');
    } catch {
      toast('Failed to delete order', 'error');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="rounded-lg border border-ink-faint/30 px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
      >
        Delete
      </button>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} size="3xl" title="Edit order">
        <OrderForm
          mode="edit"
          order={order}
          onCancel={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false);
            toast('Order updated', 'success');
            onChanged();
          }}
        />
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} size="sm" title="Delete order?" subtitle={`${order.orderCode} · ${order.name} will be permanently removed.`}>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-lg border border-ink-faint/30 px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper-deep">
            Cancel
          </button>
          <button type="button" onClick={remove} disabled={busy} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            Delete order
          </button>
        </div>
      </Modal>
    </div>
  );
}
