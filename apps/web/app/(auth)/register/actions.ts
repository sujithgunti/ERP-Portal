'use server';

import { redirect } from 'next/navigation';
import type { AuthUser } from '@erp/types';
import { setSession } from '@/lib/session';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

export interface RegisterState {
  error?: string;
}

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (!name || !email || !password) {
    return { error: 'All fields are required.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  let data: { accessToken: string; user: AuthUser };
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
      cache: 'no-store',
    });

    if (res.status === 409) {
      return { error: 'That email is already registered.' };
    }
    if (!res.ok) {
      return { error: 'Could not create your account. Please try again.' };
    }
    data = await res.json();
  } catch {
    return { error: 'Cannot reach the server. Is the API running?' };
  }

  await setSession(data.accessToken, data.user);
  redirect(HOME_BY_ROLE[data.user.role] ?? '/');
}
