'use client';

import type { ReactNode } from 'react';

/**
 * Global data table — the single table primitive for the app.
 *
 * Columns describe headers + how to render each cell; rows are any objects.
 * Styled to the pine/kraft/paper system. Handles loading / empty states and an
 * optional footer (e.g. totals row). Use `render` for custom cells (badges,
 * money, inputs) so even interactive tables can use it.
 */

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Custom cell renderer. Falls back to `row[key]` as text. */
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

function alignClass(a?: 'left' | 'right' | 'center'): string {
  return a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  emptyTitle = 'No data',
  emptyHint,
  footer,
  wrap = true,
  className = '',
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  footer?: ReactNode;
  /** Wrap in the standard Card shell. Set false when embedding in an existing card. */
  wrap?: boolean;
  className?: string;
}) {
  const body =
    loading && rows.length === 0 ? (
      <p className="px-6 py-16 text-center text-sm text-ink-faint">Loading…</p>
    ) : rows.length === 0 ? (
      <div className="px-6 py-16 text-center">
        <p className="font-display text-lg text-ink">{emptyTitle}</p>
        {emptyHint ? <p className="mt-1 text-sm text-ink-soft">{emptyHint}</p> : null}
      </div>
    ) : (
      <table className="w-full text-left text-sm">
        <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 font-semibold first:pl-6 last:pr-6 ${alignClass(c.align)} ${c.headerClassName ?? ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={getRowKey(row, i)} className="border-t border-ink-faint/10 hover:bg-paper-deep/20">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3.5 first:pl-6 last:pr-6 ${alignClass(c.align)} ${c.className ?? 'text-ink'}`}
                >
                  {c.render ? c.render(row, i) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot className="border-t-2 border-ink-faint/15 bg-paper-deep/30 font-semibold text-ink">
            {footer}
          </tfoot>
        ) : null}
      </table>
    );

  if (!wrap) return <div className={`overflow-x-auto ${className}`}>{body}</div>;

  return (
    <div className={`overflow-hidden rounded-2xl border border-ink-faint/15 bg-paper-card shadow-card ${className}`}>
      <div className="overflow-x-auto">{body}</div>
    </div>
  );
}
