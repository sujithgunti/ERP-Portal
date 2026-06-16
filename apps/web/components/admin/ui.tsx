import Link from 'next/link';
import type { OrderStatus, Priority, ProductionStage } from '@erp/types';
import { PRODUCTION_STAGE_ORDER, PRODUCTION_STAGES } from '@erp/types';

/** Format a number as Indian Rupees. `decimals` controls fraction digits (default 2). */
export function inr(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0);
}

/** Human label for an expense category enum value (e.g. MACHINE_MAINTENANCE → "Machine Maintenance"). */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function stageLabel(stage: ProductionStage): string {
  return stage
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Completion % from the order's current stage (DELIVERED = 100%). 10 stages. */
export function stageProgress(stage: ProductionStage): number {
  const idx = PRODUCTION_STAGE_ORDER.indexOf(stage);
  const last = PRODUCTION_STAGE_ORDER.length - 1; // 9
  if (idx < 0) return 0;
  return Math.round((idx / last) * 100);
}

/** Completion % from independently-checked stages (DELIVERED counts as 100%). */
export function progressPct(completedStages: ProductionStage[]): number {
  const total = PRODUCTION_STAGES.length; // 9 production stages
  const done = completedStages.filter((s) => s !== 'DELIVERED').length;
  return Math.round((Math.min(done, total) / total) * 100);
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-paper-deep">
      <div
        className="h-full rounded-full bg-pine-moss transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-paper-card p-5 shadow-card ${
        accent ? 'border-kraft/40' : 'border-ink-faint/15'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-4xl font-normal tracking-tight ${
          accent ? 'text-kraft-dark' : 'text-pine'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  ACTIVE: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  DELAYED: 'bg-red-50 text-red-700 ring-red-600/20',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  HIGH: 'text-red-700',
  MEDIUM: 'text-amber-700',
  LOW: 'text-ink-faint',
};

export function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  actionSlot,
}: {
  eyebrow?: string;
  title: string;
  action?: { label: string; href: string };
  actionSlot?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-kraft-dark">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-3xl font-normal tracking-tight text-pine">{title}</h1>
      </div>
      {actionSlot ??
        (action ? (
          <Link
            href={action.href}
            className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
          >
            {action.label}
          </Link>
        ) : null)}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-faint/30 bg-paper-card/50 px-6 py-16 text-center">
      <p className="font-display text-lg text-ink">{title}</p>
      {hint ? <p className="mt-1 text-sm text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink-faint/15 bg-paper-card shadow-card ${className}`}>
      {children}
    </div>
  );
}
