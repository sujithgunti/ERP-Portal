'use client';

import { useEffect, useState } from 'react';
import type {
  OrderReportRow,
  ExpenseReportRow,
  WorkEfficiencyReportRow,
  ReportResult,
} from '@/lib/types';
import { SectionHeader, StatusBadge, PriorityTag, inr, stageLabel } from '@/components/admin/ui';
import { DataTable, type Column } from '@/components/ui/data-table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useReportsStore, type ReportKind } from '@/lib/store/reports-store';

/** Plain-text money for the PDF (avoids ₹ glyph issues in the PDF font). */
function rs(n: number): string {
  return `Rs ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Build PDF head + body (all columns, as text) for the active report. */
function pdfData(kind: ReportKind, report: ReportResult<unknown>): { head: string[]; body: string[][] } {
  if (kind === 'orders') {
    const rows = report.rows as OrderReportRow[];
    return {
      head: ['Order', 'Name', 'Client', 'Qty', 'Priority', 'Status', 'Stage', 'Deadline', 'Cost/bag', 'Total cost', 'Sell/bag', 'Margin'],
      body: rows.map((r) => [
        r.orderCode, r.name, r.client, r.quantity.toLocaleString('en-IN'), r.priority, r.status,
        stageLabel(r.currentStage), fmtDate(r.deadline), rs(r.costPerBag), rs(r.totalCost),
        r.sellingPricePerBag == null ? '—' : rs(r.sellingPricePerBag),
        r.totalMargin == null ? '—' : rs(r.totalMargin),
      ]),
    };
  }
  if (kind === 'expenses') {
    const rows = report.rows as ExpenseReportRow[];
    return {
      head: ['Date', 'Type', 'Category', 'Note', 'Amount'],
      body: rows.map((r) => [fmtDate(r.date), r.direction === 'INCOMING' ? 'IN' : 'OUT', r.category ?? '—', r.note ?? '—', rs(r.amount)]),
    };
  }
  const rows = report.rows as WorkEfficiencyReportRow[];
  return {
    head: ['Date', 'Machine', 'Type', 'Bags produced'],
    body: rows.map((r) => [fmtDate(r.date), r.machine, r.type ?? '—', r.bagsProduced.toLocaleString('en-IN')]),
  };
}

/** Dynamic totals rows for the PDF footer, aligned to each report's columns. */
function pdfFooter(kind: ReportKind, report: ReportResult<unknown>): string[][] {
  const t = report.totals;
  if (kind === 'orders') {
    // cols: Order,Name,Client,Qty,Priority,Status,Stage,Deadline,Cost/bag,Total cost,Sell/bag,Margin
    return [[
      'Total', '', '', (t.quantity ?? 0).toLocaleString('en-IN'), '', '', '', '', '',
      rs(t.totalCost ?? 0), '', rs(t.totalMargin ?? 0),
    ]];
  }
  if (kind === 'expenses') {
    // cols: Date,Type,Category,Note,Amount
    return [
      ['', '', '', 'Incoming', rs(t.incoming ?? 0)],
      ['', '', '', 'Outgoing', rs(t.outgoing ?? 0)],
      ['', '', '', 'Net', rs(t.net ?? 0)],
    ];
  }
  // work-efficiency cols: Date,Machine,Type,Bags produced
  return [['Total', '', '', (t.bagsProduced ?? 0).toLocaleString('en-IN')]];
}

const TITLES: Record<ReportKind, string> = {
  orders: 'Orders Report',
  expenses: 'Expenses Report',
  'work-efficiency': 'Work Efficiency Report',
};

function todayStr(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}
function oneYearAgoStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

const TABS: { key: ReportKind; label: string }[] = [
  { key: 'orders', label: 'Orders' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'work-efficiency', label: 'Work Efficiency' },
];

export default function ReportsPage() {
  const [kind, setKind] = useState<ReportKind>('orders');
  const from = useReportsStore((s) => s.from);
  const to = useReportsStore((s) => s.to);
  const loading = useReportsStore((s) => s.loading);
  const data = useReportsStore((s) => s.data);
  const setRange = useReportsStore((s) => s.setRange);
  const fetchReport = useReportsStore((s) => s.fetch);

  // Default range = last 12 months, set once.
  useEffect(() => {
    if (!from || !to) setRange(oneYearAgoStr(), todayStr());
  }, [from, to, setRange]);

  // Fetch when tab or range changes (once range is set).
  useEffect(() => {
    if (from && to) fetchReport(kind);
  }, [kind, from, to, fetchReport]);

  const report = data[kind] as ReportResult<unknown> | undefined;
  const pdf = report ? pdfData(kind, report) : null;

  // Opens the browser's native print preview → "Save as PDF".
  function exportPdf() {
    if (report && report.count > 0) window.print();
  }

  return (
    <>
      <SectionHeader
        eyebrow="Data Tracking"
        title="Reports"
        actionSlot={
          <button
            type="button"
            onClick={exportPdf}
            disabled={!report || report.count === 0}
            className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export PDF
          </button>
        }
      />

      {/* Range + tabs control bar */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="inline-flex rounded-lg border border-ink-faint/20 bg-paper-card p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setKind(t.key)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                kind === t.key ? 'bg-pine text-paper' : 'text-ink-soft hover:bg-paper-deep'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-faint">Date range</label>
          <DateRangePicker from={from} to={to} onChange={setRange} className="w-80" />
        </div>
      </div>

      {kind === 'orders' && (
        <OrdersReport report={data.orders as ReportResult<OrderReportRow> | undefined} loading={loading} />
      )}
      {kind === 'expenses' && (
        <ExpensesReport report={data.expenses as ReportResult<ExpenseReportRow> | undefined} loading={loading} />
      )}
      {kind === 'work-efficiency' && (
        <WorkEfficiencyReport report={data['work-efficiency'] as ReportResult<WorkEfficiencyReportRow> | undefined} loading={loading} />
      )}

      {/* Print-only area — rendered into the browser's native print/Save-as-PDF preview. */}
      {pdf ? (
        <div id="report-print">
          <h1 style={{ fontSize: 20, marginBottom: 4 }}>{TITLES[kind]}</h1>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            {report ? `${fmtDate(report.from)} → ${fmtDate(report.to)}  ·  ${report.count} record(s)` : ''}
          </p>
          <table>
            <thead>
              <tr>{pdf.head.map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {pdf.body.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
            {report ? (
              <tfoot>
                {pdfFooter(kind, report).map((row, i) => (
                  <tr key={i} style={{ fontWeight: 700, background: '#f0ece1' }}>
                    {row.map((cell, j) => <td key={j}>{cell}</td>)}
                  </tr>
                ))}
              </tfoot>
            ) : null}
          </table>
        </div>
      ) : null}
    </>
  );
}

function DirectionBadge({ d }: { d: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        d === 'INCOMING' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {d === 'INCOMING' ? 'IN' : 'OUT'}
    </span>
  );
}

function OrdersReport({ report, loading }: { report?: ReportResult<OrderReportRow>; loading: boolean }) {
  const cols: Column<OrderReportRow>[] = [
    { key: 'orderCode', header: 'Order', render: (r) => <span className="font-medium text-ink">{r.orderCode}</span> },
    { key: 'name', header: 'Name', className: 'text-ink-soft' },
    { key: 'client', header: 'Client', className: 'text-ink-soft' },
    { key: 'quantity', header: 'Qty', align: 'right', className: 'tabular-nums text-ink', render: (r) => r.quantity.toLocaleString('en-IN') },
    { key: 'priority', header: 'Priority', render: (r) => <PriorityTag priority={r.priority} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'currentStage', header: 'Stage', className: 'text-ink-soft', render: (r) => stageLabel(r.currentStage) },
    { key: 'deadline', header: 'Deadline', className: 'text-ink-soft', render: (r) => fmtDate(r.deadline) },
    { key: 'costPerBag', header: 'Cost/bag', align: 'right', className: 'tabular-nums text-ink', render: (r) => inr(r.costPerBag, 2) },
    { key: 'totalCost', header: 'Total cost', align: 'right', className: 'tabular-nums text-ink', render: (r) => inr(r.totalCost) },
    { key: 'totalMargin', header: 'Margin', align: 'right', className: 'tabular-nums', render: (r) => (r.totalMargin == null ? '—' : <span className={r.totalMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}>{inr(r.totalMargin)}</span>) },
  ];
  return (
    <DataTable
      columns={cols}
      rows={report?.rows ?? []}
      getRowKey={(r) => r.orderCode}
      loading={loading}
      emptyTitle="No orders in range"
      emptyHint="Adjust the date range above."
    />
  );
}

function ExpensesReport({ report, loading }: { report?: ReportResult<ExpenseReportRow>; loading: boolean }) {
  const cols: Column<ExpenseReportRow>[] = [
    { key: 'date', header: 'Date', className: 'text-ink-soft', render: (r) => fmtDate(r.date) },
    { key: 'direction', header: 'Type', render: (r) => <DirectionBadge d={r.direction} /> },
    { key: 'category', header: 'Category', render: (r) => <span className="font-medium text-ink">{r.category ?? '—'}</span> },
    { key: 'note', header: 'Note', className: 'text-ink-soft', render: (r) => r.note ?? '—' },
    { key: 'amount', header: 'Amount', align: 'right', className: 'tabular-nums text-ink', render: (r) => inr(r.amount) },
  ];
  return (
    <DataTable
      columns={cols}
      rows={report?.rows ?? []}
      getRowKey={(_, i) => String(i)}
      loading={loading}
      emptyTitle="No expense entries in range"
      emptyHint="Adjust the date range above."
    />
  );
}

function WorkEfficiencyReport({ report, loading }: { report?: ReportResult<WorkEfficiencyReportRow>; loading: boolean }) {
  const cols: Column<WorkEfficiencyReportRow>[] = [
    { key: 'date', header: 'Date', className: 'text-ink-soft', render: (r) => fmtDate(r.date) },
    { key: 'machine', header: 'Machine', render: (r) => <span className="font-medium text-ink">{r.machine}</span> },
    { key: 'type', header: 'Type', className: 'text-ink-soft', render: (r) => r.type ?? '—' },
    { key: 'bagsProduced', header: 'Bags produced', align: 'right', className: 'tabular-nums text-ink', render: (r) => r.bagsProduced.toLocaleString('en-IN') },
  ];
  return (
    <DataTable
      columns={cols}
      rows={report?.rows ?? []}
      getRowKey={(_, i) => String(i)}
      loading={loading}
      emptyTitle="No machine output in range"
      emptyHint="Adjust the date range above."
    />
  );
}
