'use client';

import { useEffect, useRef, useState } from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { CalendarIcon } from '@/components/icons';

/**
 * Global date-range selector — one control for a {from, to} range.
 * Trigger shows the range; the popover has quick presets + From / To pickers.
 * Parent fetches data for the chosen range via `onChange`.
 */

function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function shift({ days = 0, months = 0, years = 0 }: { days?: number; months?: number; years?: number }): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - months);
  d.setDate(d.getDate() - days);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function startOf(kind: 'month' | 'year'): string {
  const d = new Date();
  const s = kind === 'year' ? new Date(d.getFullYear(), 0, 1) : new Date(d.getFullYear(), d.getMonth(), 1);
  const off = s.getTimezoneOffset();
  return new Date(s.getTime() - off * 60_000).toISOString().slice(0, 10);
}

function fmt(iso: string): string {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const PRESETS: { label: string; range: () => { from: string; to: string } }[] = [
  { label: 'Last 7 days', range: () => ({ from: shift({ days: 7 }), to: todayISO() }) },
  { label: 'Last 30 days', range: () => ({ from: shift({ days: 30 }), to: todayISO() }) },
  { label: 'Last 3 months', range: () => ({ from: shift({ months: 3 }), to: todayISO() }) },
  { label: 'Last 6 months', range: () => ({ from: shift({ months: 6 }), to: todayISO() }) },
  { label: 'Last 1 year', range: () => ({ from: shift({ years: 1 }), to: todayISO() }) },
  { label: 'This month', range: () => ({ from: startOf('month'), to: todayISO() }) },
  { label: 'This year', range: () => ({ from: startOf('year'), to: todayISO() }) },
];

export function DateRangePicker({
  from,
  to,
  onChange,
  className = '',
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const activePreset = PRESETS.find((p) => {
    const r = p.range();
    return r.from === from && r.to === to;
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="field flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-ink">
          {fmt(from)} <span className="text-ink-faint">→</span> {fmt(to)}
        </span>
        <CalendarIcon />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] rounded-2xl border border-ink-faint/15 bg-paper-card p-4 shadow-card">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => {
              const active = activePreset?.label === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    const r = p.range();
                    onChange(r.from, r.to);
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    active ? 'bg-pine text-paper' : 'bg-paper-deep/50 text-ink-soft hover:bg-paper-deep'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3 border-t border-ink-faint/12 pt-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-faint">From</label>
              <DatePicker value={from} onChange={(v) => onChange(v, to)} max={to || todayISO()} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-ink-faint">To</label>
              <DatePicker value={to} onChange={(v) => onChange(from, v)} min={from || undefined} max={todayISO()} />
            </div>
          </div>

          <div className="mt-4 flex justify-end border-t border-ink-faint/12 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-paper hover:bg-pine-deep"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
