'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

export interface ClientFormState {
  error?: string;
}

export async function createClientAction(
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const contact = String(formData.get('contact') ?? '').trim();

  if (!name) return { error: 'Client name is required.' };

  try {
    await apiFetch('/clients', {
      method: 'POST',
      body: JSON.stringify({ name, contact: contact || undefined }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return { error: msg.includes('403') ? 'Not permitted.' : 'Failed to create client.' };
  }

  revalidatePath('/admin/clients');
  redirect('/admin/clients');
}
