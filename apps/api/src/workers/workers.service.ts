import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import type { Worker, Attendance } from '@prisma/client';
import type {
  WorkerRow,
  AttendanceRosterRow,
  AttendanceSummaryRow,
} from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

/** Parse a YYYY-MM-DD (or ISO) string to a UTC midnight Date for @db.Date columns. */
function dayUTC(input: string): Date {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new BadRequestException('Invalid date');
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- workers ----

  async findAll(): Promise<WorkerRow[]> {
    const workers = await this.prisma.worker.findMany({
      orderBy: [{ active: 'desc' }, { name: 'asc' }],
    });
    return workers.map((w) => this.toWorkerRow(w));
  }

  async create(dto: CreateWorkerDto): Promise<WorkerRow> {
    const worker = await this.prisma.worker.create({
      data: { name: dto.name, phone: dto.phone, role: dto.role, active: dto.active ?? true },
    });
    return this.toWorkerRow(worker);
  }

  async update(id: string, dto: UpdateWorkerDto): Promise<WorkerRow> {
    await this.ensureWorker(id);
    const worker = await this.prisma.worker.update({
      where: { id },
      data: { name: dto.name, phone: dto.phone, role: dto.role, active: dto.active },
    });
    return this.toWorkerRow(worker);
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.ensureWorker(id);
    await this.prisma.worker.delete({ where: { id } });
    return { id };
  }

  // ---- attendance ----

  /** All active workers + their status for a given day (status null = not marked). */
  async roster(dateInput: string): Promise<AttendanceRosterRow[]> {
    const date = dayUTC(dateInput);
    const [workers, records] = await Promise.all([
      this.prisma.worker.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      this.prisma.attendance.findMany({ where: { date } }),
    ]);
    const byWorker = new Map(records.map((r) => [r.workerId, r]));
    return workers.map((w) => {
      const rec = byWorker.get(w.id);
      return {
        workerId: w.id,
        name: w.name,
        role: w.role,
        attendanceId: rec?.id ?? null,
        status: rec?.status ?? null,
        checkIn: rec?.checkIn ?? null,
        checkOut: rec?.checkOut ?? null,
        note: rec?.note ?? null,
      };
    });
  }

  /** Upsert one worker's status (+ time period) for one day. */
  async mark(dto: MarkAttendanceDto): Promise<Attendance> {
    await this.ensureWorker(dto.workerId);
    const date = dayUTC(dto.date);
    // Present / Half-day require a time period; Absent clears it.
    if (dto.status !== 'ABSENT' && (!dto.checkIn || !dto.checkOut)) {
      throw new BadRequestException('A time period (check-in and check-out) is required to mark present.');
    }
    const checkIn = dto.status === 'ABSENT' ? null : (dto.checkIn ?? null);
    const checkOut = dto.status === 'ABSENT' ? null : (dto.checkOut ?? null);
    return this.prisma.attendance.upsert({
      where: { workerId_date: { workerId: dto.workerId, date } },
      create: { workerId: dto.workerId, date, status: dto.status, checkIn, checkOut, note: dto.note },
      update: { status: dto.status, checkIn, checkOut, note: dto.note },
    });
  }

  /** Per-worker tally (present/absent/half-day) for a month. */
  async summary(month: number, year: number): Promise<AttendanceSummaryRow[]> {
    if (month < 1 || month > 12) throw new BadRequestException('Invalid month');
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const [workers, records] = await Promise.all([
      this.prisma.worker.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      this.prisma.attendance.findMany({ where: { date: { gte: start, lt: end } } }),
    ]);
    const tally = new Map<string, { present: number; absent: number; halfDay: number }>();
    for (const r of records) {
      const t = tally.get(r.workerId) ?? { present: 0, absent: 0, halfDay: 0 };
      if (r.status === AttendanceStatus.PRESENT) t.present += 1;
      else if (r.status === AttendanceStatus.ABSENT) t.absent += 1;
      else if (r.status === AttendanceStatus.HALF_DAY) t.halfDay += 1;
      tally.set(r.workerId, t);
    }
    return workers.map((w) => {
      const t = tally.get(w.id) ?? { present: 0, absent: 0, halfDay: 0 };
      return { workerId: w.id, name: w.name, role: w.role, ...t };
    });
  }

  // ---- helpers ----

  private async ensureWorker(id: string): Promise<void> {
    const exists = await this.prisma.worker.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Worker not found');
  }

  private toWorkerRow(w: Worker): WorkerRow {
    return {
      id: w.id,
      name: w.name,
      phone: w.phone,
      role: w.role,
      active: w.active,
      createdAt: w.createdAt.toISOString(),
    };
  }
}
