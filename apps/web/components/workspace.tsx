'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@erp/types';
import { useAuthStore } from '@/lib/store/auth-store';
import { RequireRole } from '@/components/auth/require-role';

// Lightweight authed landing for Supervisor / Partner — full dashboards next.
export function Workspace({ area, role }: { area: string; role: Role }) {
  return (
    <RequireRole role={role}>
      <WorkspaceInner area={area} />
    </RequireRole>
  );
}

function WorkspaceInner({ area }: { area: string }) {
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
    <main className="grain relative min-h-screen bg-paper">
      <header className="border-b border-ink-faint/15 bg-paper-card/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-medium tracking-tight text-pine">
            Verdant<span className="text-kraft-dark">ERP</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft">
              {user?.name} · <span className="font-semibold text-pine">{user?.role}</span>
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-ink-faint/30 px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-kraft-dark">{area}</p>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-tight text-pine">
          You&apos;re signed in.
        </h1>
        <p className="mt-3 max-w-md text-base text-ink-soft">
          Authentication is wired to the backend. Your role-specific dashboard is the next build.
        </p>
      </section>
    </main>
  );
}
