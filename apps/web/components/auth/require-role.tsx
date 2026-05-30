'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@erp/types';
import { getStoredUser } from '@/lib/auth-client';

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

/**
 * Client-side route guard (UX only — real authorization is enforced by the
 * NestJS guards). Reads the stored user: redirects to /login if missing, to
 * the user's home if the role doesn't match. Renders children once allowed.
 */
export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(HOME_BY_ROLE[user.role] ?? '/login');
      return;
    }
    setAllowed(true);
  }, [role, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-faint">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
