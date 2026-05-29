import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, ProductionStage } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateDailyUpdateDto } from './dto/create-daily-update.dto';

const STAGE_ORDER: ProductionStage[] = [
  ProductionStage.PAPER_PROCUREMENT,
  ProductionStage.PRINTING,
  ProductionStage.LAMINATION,
  ProductionStage.PUNCHING,
  ProductionStage.IN_HOUSE_MANUFACTURING,
  ProductionStage.HANDLE_PASTING,
  ProductionStage.PACKING,
  ProductionStage.DISPATCH,
  ProductionStage.DELIVERED,
];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters?: { status?: OrderStatus }) {
    return this.prisma.order.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      include: { client: true },
      orderBy: { deadline: 'asc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        dailyUpdates: { orderBy: { date: 'desc' }, include: { updatedBy: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async create(dto: CreateOrderDto) {
    const orderCode = dto.orderCode ?? (await this.nextOrderCode());
    return this.prisma.order.create({
      data: {
        orderCode,
        name: dto.name,
        quantity: dto.quantity,
        deadline: new Date(dto.deadline),
        priority: dto.priority,
        clientId: dto.clientId,
        size: dto.size,
        gsm: dto.gsm,
        printingType: dto.printingType,
        handleType: dto.handleType,
        lamination: dto.lamination ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    const data: Prisma.OrderUpdateInput = {
      name: dto.name,
      quantity: dto.quantity,
      priority: dto.priority,
      status: dto.status,
      size: dto.size,
      gsm: dto.gsm,
      printingType: dto.printingType,
      handleType: dto.handleType,
      lamination: dto.lamination,
      ...(dto.deadline ? { deadline: new Date(dto.deadline) } : {}),
      ...(dto.clientId ? { client: { connect: { id: dto.clientId } } } : {}),
    };
    return this.prisma.order.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.order.delete({ where: { id } });
  }

  /** Add a daily production update and advance the order's current stage in one transaction. */
  async addDailyUpdate(orderId: string, dto: CreateDailyUpdateDto, userId: string) {
    const order = await this.findOne(orderId);

    return this.prisma.$transaction(async (tx) => {
      const update = await tx.dailyUpdate.create({
        data: {
          orderId,
          stage: dto.stage,
          quantityCompleted: dto.quantityCompleted,
          quantityPending: dto.quantityPending,
          remarks: dto.remarks,
          date: dto.date ? new Date(dto.date) : new Date(),
          updatedById: userId,
        },
      });

      const reportedIdx = STAGE_ORDER.indexOf(dto.stage);
      const currentIdx = STAGE_ORDER.indexOf(order.currentStage);
      const nextStage = reportedIdx > currentIdx ? dto.stage : order.currentStage;
      const isDelayed = order.status !== OrderStatus.DELIVERED && new Date() > order.deadline;

      await tx.order.update({
        where: { id: orderId },
        data: {
          currentStage: nextStage,
          status: isDelayed ? OrderStatus.DELAYED : order.status,
        },
      });

      return update;
    });
  }

  async markDelivered(id: string) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.DELIVERED,
        currentStage: ProductionStage.DELIVERED,
        deliveredAt: new Date(),
      },
    });
  }

  async verifyLatestUpdate(orderId: string) {
    const latest = await this.prisma.dailyUpdate.findFirst({
      where: { orderId },
      orderBy: { date: 'desc' },
    });
    if (!latest) {
      throw new NotFoundException('No daily update to verify');
    }
    return this.prisma.dailyUpdate.update({
      where: { id: latest.id },
      data: { verified: true },
    });
  }

  private async nextOrderCode(): Promise<string> {
    const count = await this.prisma.order.count();
    return `ORD-${String(count + 1).padStart(3, '0')}`;
  }
}
