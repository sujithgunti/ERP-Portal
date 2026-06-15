import { Injectable } from '@nestjs/common';
import type {
  OrderReportRow,
  ExpenseReportRow,
  WorkEfficiencyReportRow,
  ReportResult,
} from '@erp/types';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolve from/to query (YYYY-MM-DD); default = last 12 months → today. */
  private range(from?: string, to?: string): { from: Date; to: Date } {
    const toDate = to ? new Date(`${to}T23:59:59.999Z`) : new Date();
    const fromDate = from
      ? new Date(`${from}T00:00:00.000Z`)
      : new Date(Date.UTC(toDate.getUTCFullYear() - 1, toDate.getUTCMonth(), toDate.getUTCDate()));
    return { from: fromDate, to: toDate };
  }

  private iso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  async orders(from?: string, to?: string): Promise<ReportResult<OrderReportRow>> {
    const r = this.range(from, to);
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: r.from, lte: r.to } },
      include: { client: true, cost: { include: { materialLines: true } } },
      orderBy: { createdAt: 'desc' },
    });

    let grandTotalCost = 0;
    let grandTotalMargin = 0;
    const rows: OrderReportRow[] = orders.map((o) => {
      const materialPerBag = (o.cost?.materialLines ?? []).reduce((s, l) => s + Number(l.costPerBag), 0);
      const overheadPerBag = o.cost?.overheadPerBag != null ? Number(o.cost.overheadPerBag) : 0;
      const costPerBag = materialPerBag + overheadPerBag;
      const totalCost = costPerBag * o.quantity;
      const sellingPricePerBag = o.cost?.sellingPricePerBag != null ? Number(o.cost.sellingPricePerBag) : null;
      const totalMargin = sellingPricePerBag != null ? (sellingPricePerBag - costPerBag) * o.quantity : null;
      grandTotalCost += totalCost;
      if (totalMargin != null) grandTotalMargin += totalMargin;
      return {
        orderCode: o.orderCode,
        name: o.name,
        client: o.client.name,
        quantity: o.quantity,
        priority: o.priority,
        status: o.status,
        currentStage: o.currentStage,
        paperType: o.paperType,
        deadline: o.deadline.toISOString(),
        createdAt: o.createdAt.toISOString(),
        deliveredAt: o.deliveredAt ? o.deliveredAt.toISOString() : null,
        materialPerBag,
        overheadPerBag,
        costPerBag,
        totalCost,
        sellingPricePerBag,
        totalMargin,
      };
    });

    return {
      from: this.iso(r.from),
      to: this.iso(r.to),
      count: rows.length,
      rows,
      totals: { quantity: rows.reduce((s, x) => s + x.quantity, 0), totalCost: grandTotalCost, totalMargin: grandTotalMargin },
    };
  }

  async expenses(from?: string, to?: string): Promise<ReportResult<ExpenseReportRow>> {
    const r = this.range(from, to);
    const items = await this.prisma.dailyExpense.findMany({
      where: { date: { gte: r.from, lte: r.to } },
      orderBy: { date: 'desc' },
    });
    let incoming = 0;
    let outgoing = 0;
    const rows: ExpenseReportRow[] = items.map((e) => {
      const amount = Number(e.amount);
      if (e.direction === 'INCOMING') incoming += amount;
      else outgoing += amount;
      return {
        date: e.date.toISOString().slice(0, 10),
        direction: e.direction,
        category: e.category,
        amount,
        note: e.note,
      };
    });
    return {
      from: this.iso(r.from),
      to: this.iso(r.to),
      count: rows.length,
      rows,
      totals: { incoming, outgoing, net: incoming - outgoing },
    };
  }

  async workEfficiency(from?: string, to?: string): Promise<ReportResult<WorkEfficiencyReportRow>> {
    const r = this.range(from, to);
    const items = await this.prisma.machineProduction.findMany({
      where: { date: { gte: r.from, lte: r.to } },
      include: { machine: true },
      orderBy: { date: 'desc' },
    });
    const rows: WorkEfficiencyReportRow[] = items.map((m) => ({
      date: m.date.toISOString().slice(0, 10),
      machine: m.machine.name,
      type: m.machine.type,
      bagsProduced: m.bagsProduced,
    }));
    return {
      from: this.iso(r.from),
      to: this.iso(r.to),
      count: rows.length,
      rows,
      totals: { bagsProduced: rows.reduce((s, x) => s + x.bagsProduced, 0) },
    };
  }
}
