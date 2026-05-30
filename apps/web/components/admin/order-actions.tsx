'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { OrderForm } from '@/components/admin/order-form';
import { DailyUpdateForm } from '@/components/admin/daily-update-form';
import { useToast } from '@/lib/store/ui-store';
import { prismaApi } from '@/lib/api';
import type { OrderDetail } from '@/lib/types';

export function OrderActions({ order, onChanged }: { order: OrderDetail; onChanged: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const delivered = order.status === 'DELIVERED';

  async function markDelivered() {
    setBusy(true);
    try {
      await prismaApi('POST', `/orders/${order.id}/deliver`);
      toast('Order marked delivered', 'success');
      onChanged();
    } catch {
      toast('Failed to mark delivered', 'error');
    } finally {
      setBusy(false);
    }
  }

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
      {!delivered && (
        <button
          type="button"
          onClick={() => setUpdateOpen(true)}
          className="rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
        >
          + Add update
        </button>
      )}

      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="rounded-lg border border-ink-faint/30 px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep"
      >
        Edit
      </button>

      {!delivered && (
        <button
          type="button"
          onClick={markDelivered}
          disabled={busy}
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-60"
        >
          Mark delivered
        </button>
      )}

      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
      >
        Delete
      </button>

      <Modal open={updateOpen} onClose={() => setUpdateOpen(false)} size="lg" title="Add daily update" subtitle="Record today's production for this order.">
        <DailyUpdateForm
          orderId={order.id}
          currentStage={order.currentStage}
          onCancel={() => setUpdateOpen(false)}
          onSuccess={() => {
            setUpdateOpen(false);
            toast('Daily update saved', 'success');
            onChanged();
          }}
        />
      </Modal>

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
