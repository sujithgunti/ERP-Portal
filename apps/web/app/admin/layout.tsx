'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { RequireRole } from '@/components/auth/require-role';
import { Sidebar } from '@/components/admin/sidebar';
import { MobileNav } from '@/components/admin/mobile-nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="ADMIN">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const logout = () => {
    clear();
    router.replace('/login');
  };

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-ink-faint/15 bg-paper/85 px-4 py-3.5 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <span className="hidden text-sm text-ink-faint sm:inline">Admin Console</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">{user?.name}</p>
              <p className="text-xs uppercase tracking-wide text-kraft-dark">{user?.role}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine text-sm font-semibold text-paper">
              {(user?.name ?? '?').charAt(0).toUpperCase()}
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-ink-faint/30 px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="grain relative flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
