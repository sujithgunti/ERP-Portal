import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

/**
 * Server-side fetch to the NestJS API, attaching the user's JWT (from the
 * httpOnly `erp_token` cookie) as a Bearer token. Use only in Server
 * Components / server actions / route handlers.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get('erp_token')?.value;

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
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${path}: ${body}`);
  }

  // 204 / empty body tolerance
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
