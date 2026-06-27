import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, OrderStatus, TAB } from '@erp/types';
import type { AuthUser } from '@erp/types';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TabGuard } from '../auth/guards/tab.guard';
import { RequireTab } from '../auth/decorators/require-tab.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateDailyUpdateDto } from './dto/create-daily-update.dto';

@UseGuards(JwtAuthGuard, RolesGuard, TabGuard)
@RequireTab(TAB.ORDERS)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Read — all roles.
  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll({ status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // Write — Admin only.
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/updates')
  addDailyUpdate(
    @Param('id') id: string,
    @Body() dto: CreateDailyUpdateDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.addDailyUpdate(id, dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Post(':id/deliver')
  markDelivered(@Param('id') id: string) {
    return this.ordersService.markDelivered(id);
  }

  // Verification — Supervisor (and Admin).
  @Roles(Role.SUPERVISOR, Role.ADMIN)
  @Post(':id/verify')
  verify(@Param('id') id: string) {
    return this.ordersService.verifyLatestUpdate(id);
  }
}
