'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TAB_META, hasTab } from '@erp/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePermissionsStore } from '@/lib/store/permissions-store';
import { Sidebar } from '@/components/admin/sidebar';
import { MobileNav } from '@/components/admin/mobile-nav';

/** The tab bit for a pathname, or null for non-tab pages (e.g. /admin/roles). */
function tabBitFor(pathname: string): number | null {
  const match = [...TAB_META]
    .sort((a, b) => b.route.length - a.route.length) // longest route wins
    .find((t) => (t.route === '/admin' ? pathname === '/admin' : pathname.startsWith(t.route)));
  return match ? match.bit : null;
}

/** First tab a mask permits — where to land/redirect a role. */
function firstTab(mask: number): string {
  const t = TAB_META.find((t) => hasTab(mask, t.bit));
  return t ? t.route : '/login';
}

/**
 * Shared app shell for all roles. Auth + tab-permission gate (UX only — the
 * NestJS TabGuard is the real enforcement). Filters by the user's tab mask and
 * keeps Manage Roles admin-only.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const myTabs = usePermissionsStore((s) => s.myTabs);
  const fetchMine = usePermissionsStore((s) => s.fetchMine);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    hydrate();
    if (!useAuthStore.getState().user) {
      router.replace('/login');
      return;
    }
    fetchMine();
  }, [hydrate, fetchMine, router]);

  useEffect(() => {
    if (!user || myTabs === null) return; // wait for auth + permissions
    if (user.role === 'ADMIN') {
      setAllowed(true);
      return;
    }
    // Manage Roles is administrative — never available to other roles.
    if (pathname.startsWith('/admin/roles')) {
      setAllowed(false);
      router.replace(firstTab(myTabs));
      return;
    }
    const bit = tabBitFor(pathname);
    if (bit !== null && !hasTab(myTabs, bit)) {
      setAllowed(false);
      router.replace(firstTab(myTabs));
      return;
    }
    setAllowed(true);
  }, [user, myTabs, pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <p className="text-sm text-ink-faint">Loading…</p>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const logout = () => {
    clear();
    router.replace('/login');
  };

  const consoleLabel = user?.role === 'ADMIN' ? 'Admin Console' : 'Workspace';

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-ink-faint/15 bg-paper/85 px-4 py-3.5 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <MobileNav />
            <span className="hidden text-sm text-ink-faint sm:inline">{consoleLabel}</span>
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
