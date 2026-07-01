'use client';

import { useAuthStore } from '@/lib/store/auth-store';

/** Hook: true when the signed-in user is an ADMIN. */
export function useIsAdmin(): boolean {
  return useAuthStore((s) => s.user?.role === 'ADMIN');
}

/**
 * Renders children only for ADMIN users. Writes are admin-only (the backend
 * enforces this too); this just hides the controls for read-only roles.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return useIsAdmin() ? <>{children}</> : null;
}
