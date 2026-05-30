import Link from 'next/link';
import type { DashboardSummary, ProductionStage } from '@erp/types';
import { PRODUCTION_STAGE_ORDER } from '@erp/types';
import { apiFetch } from '@/lib/api-client';
import type { OrderRow } from '@/lib/types';
import { Card, StatCard, StatusBadge, PriorityTag, stageLabel } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [summary, orders] = await Promise.all([
    apiFetch<DashboardSummary>('/dashboard'),
    apiFetch<OrderRow[]>('/orders'),
  ]);

  const maxStage = Math.max(1, ...Object.values(summary.stageDistribution));
  const recent = orders.slice(0, 6);

  return (
    <>
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-kraft-dark">
          Production Control
        </p>
        <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-pine">
          Today&apos;s overview
        </h1>
      </div>

      {/* stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active orders" value={summary.activeOrders} />
        <StatCard label="Delivered today" value={summary.deliveredToday} />
        <StatCard label="Due soon (3d)" value={summary.dueSoon} accent />
        <StatCard label="Delayed" value={summary.delayedOrders} />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* stage distribution */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="font-display text-lg text-pine">Stage distribution</h2>
          <p className="mt-0.5 text-xs text-ink-soft">Active orders by production stage.</p>
          <ul className="mt-5 space-y-3">
            {PRODUCTION_STAGE_ORDER.filter((s) => s !== 'DELIVERED').map((stage: ProductionStage) => {
              const count = summary.stageDistribution[stage] ?? 0;
              return (
                <li key={stage} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-[13px] text-ink-soft">
                    {stageLabel(stage)}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-deep">
                    <div
                      className="h-full rounded-full bg-pine-moss"
                      style={{ width: `${(count / maxStage) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-[13px] font-semibold text-ink">{count}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* recent orders */}
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
              <thead className="text-[11px] uppercase tracking-wide text-ink-faint">
                <tr>
                  <th className="px-6 py-2.5 font-semibold">Order</th>
                  <th className="px-3 py-2.5 font-semibold">Stage</th>
                  <th className="px-3 py-2.5 font-semibold">Priority</th>
                  <th className="px-6 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-ink-faint/10">
                    <td className="px-6 py-3">
                      <p className="font-medium text-ink">{o.name}</p>
                      <p className="text-xs text-ink-faint">
                        {o.orderCode} · {o.client.name}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{stageLabel(o.currentStage)}</td>
                    <td className="px-3 py-3">
                      <PriorityTag priority={o.priority} />
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={o.status} />
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
