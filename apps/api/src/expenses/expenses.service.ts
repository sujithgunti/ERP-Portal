import { Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseDirection } from '@prisma/client';
import type { DailyExpense } from '@prisma/client';
import type { DailyExpenseDay, DailyExpenseRow } from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { CreateDailyExpenseDto } from './dto/create-daily-expense.dto';
import { UpdateDailyExpenseDto } from './dto/update-daily-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Entries for a single day, with totals. */
  async findDay(dateStr: string): Promise<DailyExpenseDay> {
    const date = this.dayStart(dateStr);
    const entries = await this.prisma.dailyExpense.findMany({
      where: { date },
      orderBy: { createdAt: 'asc' },
    });
    return this.toDay(dateStr, entries);
  }

  /** Most recent `days` distinct days that have entries, newest first. */
  async findRecent(days: number): Promise<DailyExpenseDay[]> {
    const entries = await this.prisma.dailyExpense.findMany({
      orderBy: { date: 'desc' },
    });
    const byDay = new Map<string, DailyExpense[]>();
    for (const e of entries) {
      const key = e.date.toISOString().slice(0, 10);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(e);
    }
    return Array.from(byDay.entries())
      .slice(0, days)
      .map(([day, list]) =>
        this.toDay(
          day,
          // within a day, oldest first
          [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
        ),
      );
  }

  create(dto: CreateDailyExpenseDto): Promise<DailyExpense> {
    return this.prisma.dailyExpense.create({
      data: {
        date: this.dayStart(dto.date),
        direction: dto.direction as ExpenseDirection,
        amount: dto.amount,
        category: dto.category,
        note: dto.note,
      },
    });
  }

  async update(id: string, dto: UpdateDailyExpenseDto): Promise<DailyExpense> {
    await this.ensure(id);
    return this.prisma.dailyExpense.update({
      where: { id },
      data: {
        ...(dto.date ? { date: this.dayStart(dto.date) } : {}),
        direction: dto.direction as ExpenseDirection | undefined,
        amount: dto.amount,
        category: dto.category,
        note: dto.note,
      },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.ensure(id);
    await this.prisma.dailyExpense.delete({ where: { id } });
    return { id };
  }

  // ---- helpers ----

  private async ensure(id: string): Promise<void> {
    const exists = await this.prisma.dailyExpense.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Expense entry not found');
  }

  /** Parse YYYY-MM-DD into a UTC midnight Date (matches @db.Date semantics). */
  private dayStart(dateStr: string): Date {
    return new Date(`${dateStr.slice(0, 10)}T00:00:00.000Z`);
  }

  private toDay(date: string, entries: DailyExpense[]): DailyExpenseDay {
    const rows: DailyExpenseRow[] = entries.map((e) => ({
      id: e.id,
      date: e.date.toISOString().slice(0, 10),
      direction: e.direction,
      amount: Number(e.amount),
      category: e.category,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    }));
    const incoming = rows
      .filter((r) => r.direction === 'INCOMING')
      .reduce((s, r) => s + r.amount, 0);
    const outgoing = rows
      .filter((r) => r.direction === 'OUTGOING')
      .reduce((s, r) => s + r.amount, 0);
    return { date, incoming, outgoing, net: incoming - outgoing, entries: rows };
  }
}
