'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PRODUCTION_STAGE_ORDER } from '@erp/types';
import { useApi } from '@/lib/use-api';
import type { OrderDetail } from '@/lib/types';
import { Card, StatusBadge, PriorityTag, ProgressBar, stageLabel, stageProgress } from '@/components/admin/ui';
import { OrderActions } from '@/components/admin/order-actions';
import { OrderCostCard } from '@/components/admin/order-cost-form';

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

  const progress = order.status === 'DELIVERED' ? 100 : stageProgress(order.currentStage);
  const currentIdx = PRODUCTION_STAGE_ORDER.indexOf(order.currentStage);

  const specs: [string, string][] = [
    ['Quantity', order.quantity.toLocaleString()],
    ['Deadline', new Date(order.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })],
    ['Size', order.size ?? '—'],
    ['GSM', order.gsm != null ? String(order.gsm) : '—'],
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
        <OrderActions order={order} onChanged={refetch} />
      </div>

      <Card className="mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-pine">Production progress</h2>
            <p className="text-sm text-ink-soft">
              Current stage: <span className="font-semibold text-ink">{stageLabel(order.currentStage)}</span>
            </p>
          </div>
          <span className="font-display text-3xl text-pine">{progress}%</span>
        </div>
        <ProgressBar value={progress} />

        <ol className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {PRODUCTION_STAGE_ORDER.map((s, i) => {
            const done = order.status === 'DELIVERED' || i < currentIdx;
            const active = i === currentIdx && order.status !== 'DELIVERED';
            return (
              <li key={s} className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    done ? 'bg-pine-moss text-paper' : active ? 'bg-kraft text-pine-deep ring-2 ring-kraft/40' : 'bg-paper-deep text-ink-faint'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`text-[11px] leading-tight ${active ? 'font-semibold text-ink' : 'text-ink-faint'}`}>
                  {stageLabel(s)}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      <OrderCostCard orderId={order.id} />

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
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Stage</th>
                  <th className="px-3 py-3 font-semibold">Done</th>
                  <th className="px-3 py-3 font-semibold">Pending</th>
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
                    <td className="px-3 py-3 tabular-nums text-ink">{u.quantityCompleted.toLocaleString()}</td>
                    <td className="px-3 py-3 tabular-nums text-ink-soft">{u.quantityPending.toLocaleString()}</td>
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
          )}
        </Card>
      </div>
    </>
  );
}
