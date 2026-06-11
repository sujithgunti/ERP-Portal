import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { OrderCostBreakdown } from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { SetOrderCostDto } from './dto/set-order-cost.dto';

const COST_INCLUDE = {
  materialLines: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderCostInclude;

@Injectable()
export class CostingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Get the cost breakdown for an order, creating an empty cost record on first access. */
  async getBreakdown(orderId: string): Promise<OrderCostBreakdown> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    let cost = await this.prisma.orderCost.findUnique({
      where: { orderId },
      include: COST_INCLUDE,
    });
    if (!cost) {
      cost = await this.prisma.orderCost.create({
        data: { orderId },
        include: COST_INCLUDE,
      });
    }

    return this.compute(orderId, order.quantity, cost);
  }

  /** Replace the order's material lines + manual overhead + selling price in one transaction. */
  async setCost(orderId: string, dto: SetOrderCostDto): Promise<OrderCostBreakdown> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const cost = await this.prisma.$transaction(async (tx) => {
      const upserted = await tx.orderCost.upsert({
        where: { orderId },
        create: {
          orderId,
          overheadPerBag: dto.overheadPerBag ?? null,
          sellingPricePerBag: dto.sellingPricePerBag ?? null,
          note: dto.note,
        },
        update: {
          overheadPerBag: dto.overheadPerBag ?? null,
          sellingPricePerBag: dto.sellingPricePerBag ?? null,
          note: dto.note,
        },
      });

      await tx.materialLine.deleteMany({ where: { orderCostId: upserted.id } });
      if (dto.materialLines.length > 0) {
        await tx.materialLine.createMany({
          data: dto.materialLines.map((l) => ({
            orderCostId: upserted.id,
            name: l.name,
            costPerBag: l.costPerBag,
          })),
        });
      }

      return tx.orderCost.findUniqueOrThrow({
        where: { id: upserted.id },
        include: COST_INCLUDE,
      });
    });

    return this.compute(orderId, order.quantity, cost);
  }

  private compute(
    orderId: string,
    quantity: number,
    cost: Prisma.OrderCostGetPayload<{ include: typeof COST_INCLUDE }>,
  ): OrderCostBreakdown {
    const materialLines = cost.materialLines.map((l) => ({
      id: l.id,
      name: l.name,
      costPerBag: Number(l.costPerBag),
    }));
    const materialPerBag = materialLines.reduce((sum, l) => sum + l.costPerBag, 0);

    const overheadPerBag = cost.overheadPerBag != null ? Number(cost.overheadPerBag) : 0;

    const costPerBag = materialPerBag + overheadPerBag;
    const totalCost = costPerBag * quantity;

    const sellingPricePerBag =
      cost.sellingPricePerBag != null ? Number(cost.sellingPricePerBag) : null;
    const marginPerBag = sellingPricePerBag != null ? sellingPricePerBag - costPerBag : null;
    const totalMargin = marginPerBag != null ? marginPerBag * quantity : null;
    const marginPct =
      sellingPricePerBag != null && sellingPricePerBag > 0
        ? ((sellingPricePerBag - costPerBag) / sellingPricePerBag) * 100
        : null;

    return {
      orderId,
      quantity,
      materialLines,
      materialPerBag,
      overheadPerBag,
      costPerBag,
      totalCost,
      sellingPricePerBag,
      marginPerBag,
      totalMargin,
      marginPct,
      note: cost.note,
    };
  }
}
