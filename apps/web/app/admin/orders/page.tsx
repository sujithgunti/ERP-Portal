import Link from 'next/link';
import type { OrderStatus } from '@erp/types';
import { apiFetch } from '@/lib/api-client';
import type { OrderRow, ClientRow } from '@/lib/types';
import { Card, SectionHeader, StatusBadge, PriorityTag, EmptyState, stageLabel } from '@/components/admin/ui';
import { NewOrderButton } from '@/components/admin/new-order-button';

export const dynamic = 'force-dynamic';

const FILTERS: { label: string; value?: OrderStatus }[] = [
  { label: 'All' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Delayed', value: 'DELAYED' },
  { label: 'Delivered', value: 'DELIVERED' },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const query = status ? `?status=${status}` : '';
  const [orders, clients] = await Promise.all([
    apiFetch<OrderRow[]>(`/orders${query}`),
    apiFetch<ClientRow[]>('/clients'),
  ]);

  return (
    <>
      <SectionHeader
        eyebrow="Order Management"
        title="Orders"
        actionSlot={<NewOrderButton clients={clients} />}
      />

      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => {
          const active = (f.value ?? '') === (status ?? '');
          return (
            <Link
              key={f.label}
              href={f.value ? `/admin/orders?status=${f.value}` : '/admin/orders'}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-pine text-paper'
                  : 'border border-ink-faint/25 text-ink-soft hover:bg-paper-deep'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders here" hint="Create your first order to start tracking production." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-[11px] uppercase tracking-wide text-ink-faint">
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
                    <p className="font-medium text-ink">{o.name}</p>
                    <p className="text-xs text-ink-faint">{o.orderCode}</p>
                  </td>
                  <td className="px-3 py-3.5 text-ink-soft">{o.client.name}</td>
                  <td className="px-3 py-3.5 tabular-nums text-ink-soft">
                    {o.quantity.toLocaleString()}
                  </td>
                  <td className="px-3 py-3.5 text-ink-soft">
                    {new Date(o.deadline).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-3 py-3.5 text-ink-soft">{stageLabel(o.currentStage)}</td>
                  <td className="px-3 py-3.5">
                    <PriorityTag priority={o.priority} />
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
