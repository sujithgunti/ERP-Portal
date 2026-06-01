'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from '@/components/icons';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: GridIcon, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: BoxIcon },
  { href: '/admin/clients', label: 'Clients', icon: UsersIcon },
  { href: '/admin/expenses', label: 'Expenses', icon: RupeeIcon },
  { href: '/admin/attendance', label: 'Attendance', icon: CheckIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="grain mesh sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-hidden bg-pine-deep px-4 py-6 lg:flex">
      <div className="px-2">
        <Wordmark />
      </div>

      <nav className="mt-10 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-paper/10 text-paper' : 'text-paper/60 hover:bg-paper/5 hover:text-paper/90'
              }`}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-kraft" />
              ) : null}
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 text-xs leading-relaxed text-paper/30">
        <p className="font-display italic text-paper/40">Production Control</p>
        <p className="mt-1">Eco-bag manufacturing ERP</p>
      </div>
    </aside>
  );
}

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m3 8 9 5 9-5M12 13v8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RupeeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 4h10M7 8h10M7 4c5 0 7 1.5 7 4s-2 4-7 4l7 8"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2.5-4.6"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
