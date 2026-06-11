'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Global date picker — a clean popover calendar replacing the native
 * <input type="date">. Controlled: `value` is a YYYY-MM-DD string ('' = empty).
 * Dependency-free; styled with the pine/kraft/paper design system.
 */

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Parsed {
  y: number;
  m: number; // 1-12
  d: number;
}

function parse(v: string): Parsed | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!match) return null;
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function iso(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function todayParts(): Parsed {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}

function fmtDisplay(v: string): string {
  const p = parse(v);
  if (!p) return '';
  return `${pad(p.d)} ${MONTHS[p.m - 1].slice(0, 3)} ${p.y}`;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  id,
  placeholder = 'Select date',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sel = parse(value);
  const t = todayParts();
  const [view, setView] = useState(() => (sel ? { y: sel.y, m: sel.m } : { y: t.y, m: t.m }));

  // Re-center on the selected month whenever the value changes externally.
  useEffect(() => {
    const p = parse(value);
    if (p) setView({ y: p.y, m: p.m });
  }, [value]);

  // Close on outside click / Escape.
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

  const daysInMonth = new Date(view.y, view.m, 0).getDate();
  const firstWeekday = new Date(view.y, view.m - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function disabled(d: number): boolean {
    const cur = iso(view.y, view.m, d);
    if (min && cur < min) return true;
    if (max && cur > max) return true;
    return false;
  }

  function prevMonth() {
    setView((v) => (v.m === 1 ? { y: v.y - 1, m: 12 } : { y: v.y, m: v.m - 1 }));
  }
  function nextMonth() {
    setView((v) => (v.m === 12 ? { y: v.y + 1, m: 1 } : { y: v.y, m: v.m + 1 }));
  }
  function pick(d: number) {
    if (disabled(d)) return;
    onChange(iso(view.y, view.m, d));
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="field flex w-full items-center justify-between text-left"
      >
        <span className={value ? 'text-ink' : 'text-ink-faint'}>
          {value ? fmtDisplay(value) : placeholder}
        </span>
        <CalendarIcon />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full min-w-[16rem] rounded-2xl border border-ink-faint/15 bg-paper-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-base text-pine">
              {MONTHS[view.m - 1]} {view.y}
            </p>
            <div className="flex gap-1">
              <button type="button" onClick={prevMonth} aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-paper-deep">
                ‹
              </button>
              <button type="button" onClick={nextMonth} aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-md text-ink-soft hover:bg-paper-deep">
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WEEKDAYS.map((w, i) => (
              <span key={i} className="py-1 text-xs font-semibold text-ink-faint">{w}</span>
            ))}
            {cells.map((d, i) => {
              if (d === null) return <span key={`e${i}`} />;
              const isSel = sel && sel.y === view.y && sel.m === view.m && sel.d === d;
              const isToday = t.y === view.y && t.m === view.m && t.d === d;
              const dis = disabled(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={dis}
                  onClick={() => pick(d)}
                  className={`flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors ${
                    isSel
                      ? 'bg-pine font-semibold text-paper'
                      : dis
                        ? 'cursor-not-allowed text-ink-faint/40'
                        : isToday
                          ? 'font-semibold text-pine ring-1 ring-kraft/50 hover:bg-paper-deep'
                          : 'text-ink hover:bg-paper-deep'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-ink-faint/12 pt-2.5 text-sm">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="font-medium text-ink-soft hover:text-ink">
              Clear
            </button>
            <button
              type="button"
              onClick={() => { const c = iso(t.y, t.m, t.d); if (!(min && c < min) && !(max && c > max)) { onChange(c); setOpen(false); } }}
              className="font-semibold text-pine-moss hover:text-pine"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-faint">
      <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
