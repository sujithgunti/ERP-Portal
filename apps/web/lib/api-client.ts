import { auth } from '@/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Server-side fetch wrapper that attaches the current user's JWT (issued by the
 * NestJS API and stored in the Auth.js session) as a Bearer token.
 * Use only in Server Components / server actions / route handlers.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await auth();
  const token = session?.accessToken;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}
