'use client';

import Link from 'next/link';
import type { DashboardSummary } from '@erp/types';
import { PRODUCTION_STAGE_ORDER } from '@erp/types';
import { useApi } from '@/lib/use-api';
import type { OrderRow } from '@/lib/types';
import { Card, StatCard, StatusBadge, ProgressBar, stageLabel, stageProgress } from '@/components/admin/ui';

export default function AdminDashboard() {
  const { data: summary, loading: l1 } = useApi<DashboardSummary>('GET', '/dashboard');
  const { data: orders, loading: l2 } = useApi<OrderRow[]>('GET', '/orders');

  if (l1 || l2 || !summary || !orders) {
    return <p className="py-20 text-center text-sm text-ink-faint">Loading dashboard…</p>;
  }

  // Recent orders: exclude delayed; show active / in-progress (pending) only.
  const recent = orders.filter((o) => o.status !== 'DELAYED').slice(0, 6);

  // Order-wise stages: group non-delivered orders under their current stage.
  const ordersByStage = PRODUCTION_STAGE_ORDER.filter((s) => s !== 'DELIVERED')
    .map((stage) => ({
      stage,
      orders: orders.filter((o) => o.status !== 'DELIVERED' && o.currentStage === stage),
    }))
    .filter((g) => g.orders.length > 0);

  return (
    <>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kraft-dark">Production Control</p>
        <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-pine">Today&apos;s overview</h1>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active orders" value={summary.activeOrders} />
        <StatCard label="Delivered today" value={summary.deliveredToday} />
        <StatCard label="Due soon (3d)" value={summary.dueSoon} accent />
        <StatCard label="Delayed" value={summary.delayedOrders} />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-display text-lg text-pine">Stage distribution</h2>
          <p className="mt-0.5 text-xs text-ink-soft">Orders in each production stage.</p>
          {ordersByStage.length === 0 ? (
            <p className="mt-5 text-sm text-ink-faint">No orders in production.</p>
          ) : (
            <ul className="mt-5 max-h-[28rem] space-y-4 overflow-y-auto pr-1">
              {ordersByStage.map(({ stage, orders: list }) => (
                <li key={stage}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{stageLabel(stage)}</span>
                    <span className="rounded-full bg-paper-deep px-2 py-0.5 text-xs font-semibold text-ink-soft">{list.length}</span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {list.map((o) => (
                      <li key={o.id}>
                        <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-paper-deep/40">
                          <span className="truncate text-ink">{o.name}</span>
                          <span className="ml-2 shrink-0 text-xs text-ink-faint">{o.orderCode}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-ink-faint/12 px-6 py-4">
            <h2 className="font-display text-lg text-pine">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-pine-moss hover:text-pine">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-faint">No orders yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-6 py-2.5 font-semibold">Order</th>
                  <th className="px-3 py-2.5 font-semibold">Stage</th>
                  <th className="px-3 py-2.5 font-semibold">Progress</th>
                  <th className="px-6 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const pct = o.status === 'DELIVERED' ? 100 : stageProgress(o.currentStage);
                  return (
                    <tr key={o.id} className="border-t border-ink-faint/10">
                      <td className="px-6 py-3">
                        <Link href={`/admin/orders/${o.id}`} className="group">
                          <p className="font-medium text-ink group-hover:text-pine-moss">{o.name}</p>
                          <p className="text-xs text-ink-faint">{o.orderCode} · {o.client.name}</p>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-ink-soft">{stageLabel(o.currentStage)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20"><ProgressBar value={pct} /></div>
                          <span className="text-xs font-semibold tabular-nums text-ink-soft">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
