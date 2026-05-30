'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth-client';

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/admin',
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const user = getStoredUser();
    router.replace(user ? (HOME_BY_ROLE[user.role] ?? '/login') : '/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-sm text-ink-faint">Loading…</p>
    </div>
  );
}
