import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ExpensePeriod, ExpenseItem } from '@prisma/client';
import type { ExpensePeriodRow, ExpenseItemRow } from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { CreateExpensePeriodDto } from './dto/create-expense-period.dto';
import { UpdateExpensePeriodDto } from './dto/update-expense-period.dto';
import { CreateExpenseItemDto } from './dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from './dto/update-expense-item.dto';

type PeriodWithItems = ExpensePeriod & { items: ExpenseItem[] };

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- periods ----

  async findAllPeriods(): Promise<ExpensePeriodRow[]> {
    const periods = await this.prisma.expensePeriod.findMany({
      include: { items: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return periods.map((p) => this.toPeriodRow(p, false));
  }

  async findPeriod(id: string): Promise<ExpensePeriodRow> {
    const period = await this.prisma.expensePeriod.findUnique({
      where: { id },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    if (!period) throw new NotFoundException('Expense period not found');
    return this.toPeriodRow(period, true);
  }

  async createPeriod(dto: CreateExpensePeriodDto): Promise<ExpensePeriodRow> {
    try {
      const period = await this.prisma.expensePeriod.create({
        data: {
          month: dto.month,
          year: dto.year,
          totalBagsProduced: dto.totalBagsProduced ?? 0,
          note: dto.note,
        },
        include: { items: true },
      });
      return this.toPeriodRow(period, true);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('An expense period for that month already exists.');
      }
      throw e;
    }
  }

  async updatePeriod(id: string, dto: UpdateExpensePeriodDto): Promise<ExpensePeriodRow> {
    await this.ensurePeriod(id);
    const period = await this.prisma.expensePeriod.update({
      where: { id },
      data: {
        month: dto.month,
        year: dto.year,
        totalBagsProduced: dto.totalBagsProduced,
        note: dto.note,
      },
      include: { items: { orderBy: { createdAt: 'asc' } } },
    });
    return this.toPeriodRow(period, true);
  }

  // ---- items ----

  async addItem(periodId: string, dto: CreateExpenseItemDto): Promise<ExpenseItemRow> {
    await this.ensurePeriod(periodId);
    const item = await this.prisma.expenseItem.create({
      data: { periodId, category: dto.category, amount: dto.amount, note: dto.note },
    });
    return this.toItemRow(item);
  }

  async updateItem(id: string, dto: UpdateExpenseItemDto): Promise<ExpenseItemRow> {
    const existing = await this.prisma.expenseItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Expense item not found');
    const item = await this.prisma.expenseItem.update({
      where: { id },
      data: { category: dto.category, amount: dto.amount, note: dto.note },
    });
    return this.toItemRow(item);
  }

  async removeItem(id: string): Promise<{ id: string }> {
    const existing = await this.prisma.expenseItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Expense item not found');
    await this.prisma.expenseItem.delete({ where: { id } });
    return { id };
  }

  /** Overhead-per-bag for a period: Σ items.amount / totalBagsProduced (0 if no bags). */
  async overheadPerBag(periodId: string): Promise<number> {
    const period = await this.prisma.expensePeriod.findUnique({
      where: { id: periodId },
      include: { items: true },
    });
    if (!period) return 0;
    return this.computeOverheadPerBag(period);
  }

  // ---- helpers ----

  private async ensurePeriod(id: string): Promise<void> {
    const exists = await this.prisma.expensePeriod.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Expense period not found');
  }

  private computeOverheadPerBag(period: PeriodWithItems): number {
    const total = period.items.reduce((sum, it) => sum + Number(it.amount), 0);
    return period.totalBagsProduced > 0 ? total / period.totalBagsProduced : 0;
  }

  private toPeriodRow(period: PeriodWithItems, withItems: boolean): ExpensePeriodRow {
    const totalExpense = period.items.reduce((sum, it) => sum + Number(it.amount), 0);
    return {
      id: period.id,
      month: period.month,
      year: period.year,
      totalBagsProduced: period.totalBagsProduced,
      note: period.note,
      totalExpense,
      overheadPerBag: this.computeOverheadPerBag(period),
      itemCount: period.items.length,
      createdAt: period.createdAt.toISOString(),
      items: withItems ? period.items.map((it) => this.toItemRow(it)) : undefined,
    };
  }

  private toItemRow(item: ExpenseItem): ExpenseItemRow {
    return {
      id: item.id,
      category: item.category,
      amount: Number(item.amount),
      note: item.note,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
