import type { AuthUser } from '@erp/types';

/**
 * Client-side auth storage (localStorage).
 *
 * The JWT + user live in localStorage so the browser can call NestJS directly
 * with `Authorization: Bearer <token>`. SSR-safe via `typeof window` guards.
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function storeAuth(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
