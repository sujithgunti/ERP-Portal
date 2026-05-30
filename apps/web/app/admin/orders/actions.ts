'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

export interface OrderFormState {
  error?: string;
}

export async function createOrderAction(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const clientId = String(formData.get('clientId') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  const quantity = Number(formData.get('quantity'));
  const deadline = String(formData.get('deadline') ?? '');
  const priority = String(formData.get('priority') ?? 'MEDIUM');

  if (!clientId) return { error: 'Select a client.' };
  if (!name) return { error: 'Order name is required.' };
  if (!Number.isFinite(quantity) || quantity < 1) return { error: 'Quantity must be at least 1.' };
  if (!deadline) return { error: 'Deadline is required.' };

  const gsmRaw = String(formData.get('gsm') ?? '').trim();

  const payload = {
    clientId,
    name,
    quantity,
    deadline: new Date(deadline).toISOString(),
    priority,
    size: emptyToUndefined(formData.get('size')),
    gsm: gsmRaw ? Number(gsmRaw) : undefined,
    printingType: emptyToUndefined(formData.get('printingType')),
    handleType: emptyToUndefined(formData.get('handleType')),
    lamination: formData.get('lamination') === 'on',
  };

  try {
    await apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
  } catch (e) {
    return { error: e instanceof Error ? cleanupError(e.message) : 'Failed to create order.' };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  redirect('/admin/orders');
}

function emptyToUndefined(v: FormDataEntryValue | null): string | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : s;
}

function cleanupError(msg: string): string {
  if (msg.includes('403')) return 'You do not have permission to create orders.';
  if (msg.includes('400')) return 'Please check the form values and try again.';
  return 'Failed to create order. Please try again.';
}
