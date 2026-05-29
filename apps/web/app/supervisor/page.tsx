import { Shell } from '@/components/shell';
import { DashboardCards } from '@/components/dashboard-cards';
import { OrdersTable } from '@/components/orders-table';

export default function SupervisorPage() {
  return (
    <Shell title="Supervisor Monitor">
      <DashboardCards />
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Orders</h2>
        <span className="text-xs text-slate-400">
          Read-only. Plan production and verify completed work.
        </span>
      </div>
      <OrdersTable />
    </Shell>
  );
}
