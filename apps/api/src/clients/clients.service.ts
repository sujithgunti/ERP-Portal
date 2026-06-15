import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { orders: true },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const orderCount = await this.prisma.order.count({ where: { clientId: id } });
    if (orderCount > 0) {
      throw new BadRequestException(
        `Cannot delete client with ${orderCount} order(s). Remove or reassign the orders first.`,
      );
    }
    return this.prisma.client.delete({ where: { id } });
  }
}
