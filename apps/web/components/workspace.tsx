import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { logoutAction } from '@/app/actions';

// Lightweight authed landing — confirms the login flow end-to-end.
// Full role dashboards come next.
export async function Workspace({ area }: { area: string }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <main className="grain relative min-h-screen bg-paper">
      <header className="border-b border-ink-faint/15 bg-paper-card/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-medium tracking-tight text-pine">
            Verdant<span className="text-kraft-dark">ERP</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft">
              {user.name} · <span className="font-semibold text-pine">{user.role}</span>
            </span>
            <form action={logoutAction}>
              <button className="rounded-md border border-ink-faint/30 px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-kraft-dark">{area}</p>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-tight text-pine">
          You&apos;re signed in.
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-soft">
          Authentication is wired to the backend. Your role-specific dashboard is the next build.
        </p>
      </section>
    </main>
  );
}
