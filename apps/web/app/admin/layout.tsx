import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { logoutAction } from '@/app/actions';
import { Sidebar } from '@/components/admin/sidebar';

const HOME_BY_ROLE: Record<string, string> = {
  SUPERVISOR: '/supervisor',
  PARTNER: '/partner',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect(HOME_BY_ROLE[user.role] ?? '/login');

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-faint/15 bg-paper/85 px-6 py-3.5 backdrop-blur">
          <span className="text-sm text-ink-faint">
            Admin Console
          </span>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight text-ink">{user.name}</p>
              <p className="text-[11px] uppercase tracking-wide text-kraft-dark">{user.role}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-sm font-semibold text-paper">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <form action={logoutAction}>
              <button className="rounded-md border border-ink-faint/30 px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="grain relative flex-1 px-6 py-8 lg:px-10">
          <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
