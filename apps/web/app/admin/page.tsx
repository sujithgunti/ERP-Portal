import { Shell } from '@/components/shell';
import { DashboardCards } from '@/components/dashboard-cards';
import { OrdersTable } from '@/components/orders-table';

export default function AdminPage() {
  return (
    <Shell title="Admin Console">
      <DashboardCards />
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Orders</h2>
        <span className="text-xs text-slate-400">
          Admin can create/edit orders, post daily updates, mark delivered.
        </span>
      </div>
      <OrdersTable />
    </Shell>
  );
}
