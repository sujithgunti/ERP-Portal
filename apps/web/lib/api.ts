import { getToken, clearAuth } from '@/lib/auth-client';

/**
 * Global API client for the web frontend (CLIENT-side).
 *
 * `prismaApi` is the SINGLE function for every call to the NestJS backend.
 * It runs in the browser — so calls + responses are visible in DevTools.
 *   1. Targets `NEXT_PUBLIC_API_URL` (default http://localhost:8000).
 *   2. Attaches the JWT from localStorage as `Authorization: Bearer <token>`,
 *      unless `options.skipAuth = true` (login / register).
 *   3. JSON-serializes payloads for non-GET requests.
 *   4. On 401 from a protected call → clears auth and redirects to /login
 *      (single-token model — no refresh flow).
 *   5. Throws `ApiError` on non-2xx with the parsed body.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiOptions {
  headers?: Record<string, string>;
  skipAuth?: boolean;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function buildUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${clean}`;
}

export async function prismaApi<T = unknown>(
  method: HttpMethod,
  path: string,
  payload?: unknown,
  options: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (!options.skipAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers, signal: options.signal };
  if (payload !== undefined && method !== 'GET') {
    init.body = JSON.stringify(payload);
  }

  const res = await fetch(buildUrl(path), init);

  // Single-token model: expired/invalid token ends the session.
  if (res.status === 401 && !options.skipAuth) {
    clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new ApiError(401, null, 'session_expired');
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `request_failed_${res.status}`;
    throw new ApiError(res.status, body, message);
  }

  return body as T;
}
