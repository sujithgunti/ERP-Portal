import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Machine } from '@prisma/client';
import type {
  MachineRow,
  MachineProductionRosterRow,
  MachineSummaryRow,
} from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { SetMachineProductionDto } from './dto/set-machine-production.dto';

/** Parse a YYYY-MM-DD (or ISO) string to a UTC midnight Date for @db.Date columns. */
function dayUTC(input: string): Date {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid date');
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- machines ----

  async findAll(): Promise<MachineRow[]> {
    const machines = await this.prisma.machine.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });
    return machines.map((m) => this.toRow(m));
  }

  async create(dto: CreateMachineDto): Promise<MachineRow> {
    const machine = await this.prisma.machine.create({
      data: { name: dto.name, type: dto.type, active: dto.active ?? true },
    });
    return this.toRow(machine);
  }

  async update(id: string, dto: UpdateMachineDto): Promise<MachineRow> {
    await this.ensure(id);
    const machine = await this.prisma.machine.update({
      where: { id },
      data: { name: dto.name, type: dto.type, active: dto.active },
    });
    return this.toRow(machine);
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.ensure(id);
    await this.prisma.machine.delete({ where: { id } });
    return { id };
  }

  // ---- daily production ----

  /** All active machines + bags produced on a given day (null = not entered). */
  async roster(dateInput: string): Promise<MachineProductionRosterRow[]> {
    const date = dayUTC(dateInput);
    const [machines, records] = await Promise.all([
      this.prisma.machine.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      this.prisma.machineProduction.findMany({ where: { date } }),
    ]);
    const byMachine = new Map(records.map((r) => [r.machineId, r]));
    return machines.map((m) => {
      const rec = byMachine.get(m.id);
      return {
        machineId: m.id,
        name: m.name,
        type: m.type,
        productionId: rec?.id ?? null,
        bagsProduced: rec?.bagsProduced ?? null,
        note: rec?.note ?? null,
      };
    });
  }

  /** Upsert one machine's bag count for one day. */
  async setProduction(dto: SetMachineProductionDto) {
    await this.ensure(dto.machineId);
    const date = dayUTC(dto.date);
    return this.prisma.machineProduction.upsert({
      where: { machineId_date: { machineId: dto.machineId, date } },
      create: {
        machineId: dto.machineId,
        date,
        bagsProduced: dto.bagsProduced,
        note: dto.note,
      },
      update: { bagsProduced: dto.bagsProduced, note: dto.note },
    });
  }

  /** Per-machine totals for a month (total bags, days run, avg/day). */
  async summary(month: number, year: number): Promise<MachineSummaryRow[]> {
    if (month < 1 || month > 12) throw new BadRequestException('Invalid month');
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const [machines, records] = await Promise.all([
      this.prisma.machine.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      this.prisma.machineProduction.findMany({ where: { date: { gte: start, lt: end } } }),
    ]);
    const tally = new Map<string, { totalBags: number; daysRun: number }>();
    for (const r of records) {
      const t = tally.get(r.machineId) ?? { totalBags: 0, daysRun: 0 };
      t.totalBags += r.bagsProduced;
      if (r.bagsProduced > 0) t.daysRun += 1;
      tally.set(r.machineId, t);
    }
    return machines.map((m) => {
      const t = tally.get(m.id) ?? { totalBags: 0, daysRun: 0 };
      return {
        machineId: m.id,
        name: m.name,
        type: m.type,
        totalBags: t.totalBags,
        daysRun: t.daysRun,
        avgPerDay: t.daysRun > 0 ? Math.round(t.totalBags / t.daysRun) : 0,
      };
    });
  }

  // ---- helpers ----

  private async ensure(id: string): Promise<void> {
    const exists = await this.prisma.machine.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Machine not found');
  }

  private toRow(m: Machine): MachineRow {
    return {
      id: m.id,
      name: m.name,
      type: m.type,
      active: m.active,
      createdAt: m.createdAt.toISOString(),
    };
  }
}
