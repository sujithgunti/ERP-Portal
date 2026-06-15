'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/admin/ui';

/** Minimal shape needed to plot an order on the deadline calendar. */
export interface DeadlineItem {
  id?: string; // when present, the cell entry links to the order detail
  name: string;
  orderCode: string;
  deadline: string; // ISO date
  status: string; // OrderStatus
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Local YYYY-MM-DD key for a Date (timezone-safe, no UTC shift). */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Month calendar grid plotting orders on their deadline date.
 * Reused on the dashboard and in reports — pass the orders to display.
 */
export function DeadlineCalendar({
  items,
  title = 'Deadlines',
  subtitle = 'Orders by their deadline this month.',
  className = '',
}: {
  items: DeadlineItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  // Viewed month, defaulting to the current month.
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });

  // Group orders by their local day-key for O(1) cell lookup.
  const byDay = useMemo(() => {
    const map = new Map<string, DeadlineItem[]>();
    for (const it of items) {
      const key = dayKey(new Date(it.deadline));
      const list = map.get(key);
      if (list) list.push(it);
      else map.set(key, [it]);
    }
    return map;
  }, [items]);

  // Build the 6-row grid of day cells (leading blanks for the first weekday).
  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const leading = first.getDay();
    const out: (Date | null)[] = [];
    for (let i = 0; i < leading; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(view.year, view.month, d));
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [view]);

  const todayKey = dayKey(now);

  function shift(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }
  function goToday() {
    setView({ year: now.getFullYear(), month: now.getMonth() });
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-pine">{title}</h2>
          <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="rounded-md border border-ink-faint/25 px-2.5 py-1 text-sm text-ink-soft hover:bg-paper-deep">
            ‹
          </button>
          <button type="button" onClick={goToday} className="min-w-[8.5rem] rounded-md border border-ink-faint/25 px-2.5 py-1 text-center text-sm font-semibold text-ink hover:bg-paper-deep">
            {MONTHS[view.month]} {view.year}
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Next month" className="rounded-md border border-ink-faint/25 px-2.5 py-1 text-sm text-ink-soft hover:bg-paper-deep">
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`b${i}`} className="min-h-[4.5rem] rounded-lg bg-transparent" />;
          const key = dayKey(date);
          const list = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`min-h-[4.5rem] rounded-lg border p-1.5 text-left ${
                isToday ? 'border-kraft/60 bg-kraft/5' : 'border-ink-faint/12 bg-paper-card'
              }`}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-kraft-dark' : 'text-ink-faint'}`}>
                {date.getDate()}
              </span>
              <ul className="mt-0.5 space-y-0.5">
                {list.slice(0, 3).map((o, idx) => {
                  const overdue = o.status !== 'DELIVERED' && date < new Date(todayKey);
                  const delivered = o.status === 'DELIVERED';
                  const cls = `block truncate rounded px-1 py-0.5 text-[11px] font-medium ${
                    delivered
                      ? 'bg-emerald-50 text-emerald-700'
                      : overdue
                        ? 'bg-red-50 text-red-700'
                        : 'bg-pine/10 text-pine'
                  }`;
                  return (
                    <li key={o.id ?? `${o.orderCode}-${idx}`}>
                      {o.id ? (
                        <Link href={`/admin/orders/${o.id}`} title={`${o.orderCode} · ${o.name}`} className={cls}>
                          {o.name}
                        </Link>
                      ) : (
                        <span title={`${o.orderCode} · ${o.name}`} className={cls}>{o.name}</span>
                      )}
                    </li>
                  );
                })}
                {list.length > 3 ? (
                  <li className="px-1 text-[10px] text-ink-faint">+{list.length - 3} more</li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
