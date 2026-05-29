import { Injectable } from '@nestjs/common';
import { OrderStatus, ProductionStage } from '@erp/db';
import type { DashboardSummary } from '@erp/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(): Promise<DashboardSummary> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueSoonCutoff = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const [activeOrders, deliveredToday, dueSoon, delayedOrders, grouped] = await Promise.all([
      this.prisma.order.count({ where: { status: OrderStatus.ACTIVE } }),
      this.prisma.order.count({
        where: { status: OrderStatus.DELIVERED, deliveredAt: { gte: startOfDay } },
      }),
      this.prisma.order.count({
        where: {
          status: { not: OrderStatus.DELIVERED },
          deadline: { gte: now, lte: dueSoonCutoff },
        },
      }),
      this.prisma.order.count({
        where: {
          status: { not: OrderStatus.DELIVERED },
          deadline: { lt: now },
        },
      }),
      this.prisma.order.groupBy({
        by: ['currentStage'],
        where: { status: { not: OrderStatus.DELIVERED } },
        _count: { _all: true },
      }),
    ]);

    const stageDistribution = Object.values(ProductionStage).reduce(
      (acc, stage) => {
        acc[stage] = 0;
        return acc;
      },
      {} as Record<ProductionStage, number>,
    );
    for (const row of grouped) {
      stageDistribution[row.currentStage] = row._count._all;
    }

    return { activeOrders, deliveredToday, dueSoon, delayedOrders, stageDistribution };
  }
}
