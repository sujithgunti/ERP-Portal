import { apiFetch } from '@/lib/api-client';
import type { ClientRow } from '@/lib/types';
import { SectionHeader } from '@/components/admin/ui';
import { OrderForm } from '@/components/admin/order-form';

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
  const clients = await apiFetch<ClientRow[]>('/clients');

  return (
    <>
      <SectionHeader eyebrow="Order Management" title="New order" />
      <OrderForm clients={clients} />
    </>
  );
}
