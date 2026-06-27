'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { OrderStatus } from '@erp/types';
import { useApi } from '@/lib/use-api';
import type { OrderRow, ClientRow } from '@/lib/types';
import { Card, SectionHeader, StatusBadge, PriorityTag, EmptyState, stageLabel } from '@/components/admin/ui';
import { NewOrderButton } from '@/components/admin/new-order-button';
import { AdminOnly } from '@/components/auth/admin-only';

const FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: 'All' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Delayed', value: 'DELAYED' },
  { label: 'Delivered', value: 'DELIVERED' },
];

export default function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const path = status ? `/orders?status=${status}` : '/orders';
  const { data: orders, loading, refetch } = useApi<OrderRow[]>('GET', path);
  const { data: clients } = useApi<ClientRow[]>('GET', '/clients');

  return (
    <>
      <SectionHeader
        eyebrow="Order Management"
        title="Orders"
        actionSlot={<AdminOnly><NewOrderButton clients={clients ?? []} onCreated={refetch} /></AdminOnly>}
      />

      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => {
          const active = (f.value ?? undefined) === status;
          return (
            <button
              key={f.label}
              onClick={() => setStatus(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-pine text-paper' : 'border border-ink-faint/25 text-ink-soft hover:bg-paper-deep'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-faint">Loading orders…</p>
      ) : !orders || orders.length === 0 ? (
        <EmptyState title="No orders here" hint="Create your first order to start tracking production." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-6 py-3 font-semibold">Order</th>
                <th className="px-3 py-3 font-semibold">Client</th>
                <th className="px-3 py-3 font-semibold">Qty</th>
                <th className="px-3 py-3 font-semibold">Deadline</th>
                <th className="px-3 py-3 font-semibold">Stage</th>
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink-faint/10 hover:bg-paper-deep/20">
                  <td className="px-6 py-3.5">
                    <Link href={`/admin/orders/${o.id}`} className="group">
                      <p className="font-medium text-ink group-hover:text-pine-moss">{o.name}</p>
                      <p className="text-xs text-ink-faint">{o.orderCode}</p>
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-ink-soft">{o.client.name}</td>
                  <td className="px-3 py-3.5 tabular-nums text-ink-soft">{o.quantity.toLocaleString()}</td>
                  <td className="px-3 py-3.5 text-ink-soft">
                    {new Date(o.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-3.5 text-ink-soft">{stageLabel(o.currentStage)}</td>
                  <td className="px-3 py-3.5"><PriorityTag priority={o.priority} /></td>
                  <td className="px-6 py-3.5"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
