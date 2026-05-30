'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { OrderForm } from '@/components/admin/order-form';
import type { ClientRow } from '@/lib/types';

export function NewOrderButton({ clients }: { clients: ClientRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
      >
        + New order
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="3xl"
        title="New order"
        subtitle="Create a production order and start tracking its 9 stages."
      >
        <OrderForm clients={clients} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
