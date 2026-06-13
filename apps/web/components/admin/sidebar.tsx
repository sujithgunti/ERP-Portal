'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wordmark,
  GridIcon,
  BoxIcon,
  UsersIcon,
  RupeeIcon,
  CheckIcon,
  GaugeIcon,
  ShieldIcon,
} from '@/components/icons';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: GridIcon, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: BoxIcon },
  { href: '/admin/clients', label: 'Clients', icon: UsersIcon },
  { href: '/admin/expenses', label: 'Expenses', icon: RupeeIcon },
  { href: '/admin/attendance', label: 'Attendance', icon: CheckIcon },
  { href: '/admin/work-efficiency', label: 'Work Efficiency', icon: GaugeIcon },
  { href: '/admin/roles', label: 'Manage Roles', icon: ShieldIcon },
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
