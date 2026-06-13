'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

export default function Home() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
    const user = useAuthStore.getState().user;
    router.replace(user ? (HOME_BY_ROLE[user.role] ?? '/login') : '/login');
  }, [router, hydrate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-sm text-ink-faint">Loading…</p>
    </div>
  );
}
