import type { DashboardSummary } from '@erp/types';
import { apiFetch } from '@/lib/api-client';

export async function DashboardCards() {
  let summary: DashboardSummary | null = null;
  let error: string | null = null;

  try {
    summary = await apiFetch<DashboardSummary>('/dashboard');
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load dashboard';
  }

  if (error) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
        Dashboard unavailable: {error}
      </p>
    );
  }

  if (!summary) return null;

  const cards = [
    { label: 'Active orders', value: summary.activeOrders },
    { label: 'Delivered today', value: summary.deliveredToday },
    { label: 'Due soon (3d)', value: summary.dueSoon },
    { label: 'Delayed', value: summary.delayedOrders },
  ];

  return (
    <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold">{c.value}</p>
        </div>
      ))}
    </section>
  );
}
