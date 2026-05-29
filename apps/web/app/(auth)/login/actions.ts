'use server';

import { redirect } from 'next/navigation';
import type { AuthUser } from '@erp/types';
import { setSession } from '@/lib/session';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

export interface LoginState {
  error?: string;
}

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  let data: { accessToken: string; user: AuthUser };
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    if (res.status === 401) {
      return { error: 'Invalid email or password.' };
    }
    if (!res.ok) {
      return { error: 'Unable to sign in. Please try again.' };
    }
    data = await res.json();
  } catch {
    return { error: 'Cannot reach the server. Is the API running?' };
  }

  await setSession(data.accessToken, data.user);
  redirect(HOME_BY_ROLE[data.user.role] ?? '/');
}
