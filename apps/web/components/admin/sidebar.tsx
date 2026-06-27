'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TAB_META, hasTab } from '@erp/types';
import {
  Wordmark,
  GridIcon,
  BoxIcon,
  UsersIcon,
  RupeeIcon,
  CheckIcon,
  GaugeIcon,
  ShieldIcon,
  ReportIcon,
} from '@/components/icons';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePermissionsStore } from '@/lib/store/permissions-store';

const ICONS: Record<string, ComponentType> = {
  DASHBOARD: GridIcon,
  ORDERS: BoxIcon,
  CLIENTS: UsersIcon,
  EXPENSES: RupeeIcon,
  ATTENDANCE: CheckIcon,
  WORK_EFFICIENCY: GaugeIcon,
  REPORTS: ReportIcon,
};

type NavItem = { href: string; label: string; icon: ComponentType; exact: boolean };

export function Sidebar() {
  const pathname = usePathname();
  const myTabs = usePermissionsStore((s) => s.myTabs) ?? 0;
  const role = useAuthStore((s) => s.user?.role);

  // Tabs the user may see (filtered by their bitmask), plus Manage Roles for admins.
  const nav: NavItem[] = TAB_META.filter((t) => hasTab(myTabs, t.bit)).map((t) => ({
    href: t.route,
    label: t.label,
    icon: ICONS[t.key],
    exact: t.route === '/admin',
  }));
  if (role === 'ADMIN') {
    nav.push({ href: '/admin/roles', label: 'Manage Roles', icon: ShieldIcon, exact: false });
  }

  return (
    <aside className="grain mesh sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-hidden bg-pine-deep px-4 py-6 lg:flex">
      <div className="px-2">
        <Wordmark />
      </div>

      <nav className="mt-10 flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon, exact }) => {
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
