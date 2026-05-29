import { Shell } from '@/components/shell';
import { DashboardCards } from '@/components/dashboard-cards';
import { OrdersTable } from '@/components/orders-table';

export default function PartnerPage() {
  return (
    <Shell title="Partner Dashboard">
      <DashboardCards />
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Orders</h2>
        <span className="text-xs text-slate-400">Read-only monitoring of all orders.</span>
      </div>
      <OrdersTable />
    </Shell>
  );
}
