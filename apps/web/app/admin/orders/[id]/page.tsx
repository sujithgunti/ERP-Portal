'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApi } from '@/lib/use-api';
import type { OrderDetail } from '@/lib/types';
import { Card, StatusBadge, PriorityTag, stageLabel } from '@/components/admin/ui';
import { OrderActions } from '@/components/admin/order-actions';
import { OrderCostCard } from '@/components/admin/order-cost-form';
import { AdminOnly } from '@/components/auth/admin-only';
import { StageChecklist } from '@/components/admin/stage-checklist';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: order, loading, error, refetch } = useApi<OrderDetail>('GET', `/orders/${params.id}`);

  if (loading) return <p className="py-20 text-center text-sm text-ink-faint">Loading order…</p>;
  if (error || !order) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-ink-soft">Order not found.</p>
        <Link href="/admin/orders" className="mt-2 inline-block text-sm font-semibold text-pine-moss">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const specs: [string, string][] = [
    ['Quantity', order.quantity.toLocaleString()],
    ['Deadline', new Date(order.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })],
    ['Size', order.size ?? '—'],
    ['GSM', order.gsm != null ? String(order.gsm) : '—'],
    ['Paper type', order.paperType ?? '—'],
    ['Printing', order.printingType ?? '—'],
    ['Handle', order.handleType ?? '—'],
    ['Lamination', order.lamination ? 'Yes' : 'No'],
  ];

  return (
    <>
      <Link href="/admin/orders" className="text-sm font-medium text-pine-moss hover:text-pine">
        ← Orders
      </Link>

      <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kraft-dark">{order.orderCode}</p>
            <StatusBadge status={order.status} />
            <PriorityTag priority={order.priority} />
          </div>
          <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-pine">{order.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">{order.client.name}</p>
        </div>
        <AdminOnly><OrderActions order={order} onChanged={refetch} /></AdminOnly>
      </div>

      <Card className="mb-6 p-6">
        <StageChecklist
          orderId={order.id}
          completedStages={order.completedStages}
          delivered={order.status === 'DELIVERED'}
          onChanged={refetch}
        />
      </Card>

      <AdminOnly><OrderCostCard orderId={order.id} /></AdminOnly>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="font-display text-lg text-pine">Specifications</h2>
          <dl className="mt-4 space-y-2.5">
            {specs.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-ink-faint/10 pb-2.5 text-sm">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          {order.notes ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Notes</p>
              <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-paper-deep/30 px-3.5 py-3 text-sm text-ink-soft">
                {order.notes}
              </p>
            </div>
          ) : null}
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="border-b border-ink-faint/12 px-6 py-4">
            <h2 className="font-display text-lg text-pine">Daily update timeline</h2>
            <p className="text-sm text-ink-soft">{order.dailyUpdates.length} update(s)</p>
          </div>
          {order.dailyUpdates.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-faint">
              No updates yet. Add the first daily update to start tracking.
            </p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Stage</th>
                  <th className="px-6 py-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {order.dailyUpdates.map((u) => (
                  <tr key={u.id} className="border-t border-ink-faint/10 align-top">
                    <td className="px-6 py-3 text-ink-soft">
                      {new Date(u.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-3 py-3 text-ink">{stageLabel(u.stage)}</td>
                    <td className="px-6 py-3 text-ink-soft">
                      {u.remarks ?? '—'}
                      {u.verified ? (
                        <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          verified
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
