import type { OrderStatus, Priority, ProductionStage } from '@erp/types';
import { apiFetch } from '@/lib/api-client';

interface OrderRow {
  id: string;
  orderCode: string;
  name: string;
  quantity: number;
  deadline: string;
  priority: Priority;
  status: OrderStatus;
  currentStage: ProductionStage;
  client: { name: string };
}

const statusColor: Record<OrderStatus, string> = {
  ACTIVE: 'bg-blue-100 text-blue-700',
  DELAYED: 'bg-red-100 text-red-700',
  DELIVERED: 'bg-green-100 text-green-700',
};

export async function OrdersTable() {
  let orders: OrderRow[] = [];
  let error: string | null = null;

  try {
    orders = await apiFetch<OrderRow[]>('/orders');
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load orders';
  }

  if (error) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
        Orders unavailable: {error}
      </p>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Qty</th>
            <th className="px-4 py-3">Deadline</th>
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                No orders yet.
              </td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">
                  {o.orderCode} · {o.name}
                </td>
                <td className="px-4 py-3">{o.client.name}</td>
                <td className="px-4 py-3">{o.quantity.toLocaleString()}</td>
                <td className="px-4 py-3">{new Date(o.deadline).toLocaleDateString()}</td>
                <td className="px-4 py-3">{o.currentStage.replaceAll('_', ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[o.status]}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
