import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { Role, TAB } from '@erp/types';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TabGuard } from '../auth/guards/tab.guard';
import { RequireTab } from '../auth/decorators/require-tab.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CostingService } from './costing.service';
import { SetOrderCostDto } from './dto/set-order-cost.dto';

@UseGuards(JwtAuthGuard, RolesGuard, TabGuard)
@RequireTab(TAB.REPORTS)
@Controller('orders')
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  // Read = all authenticated roles.
  @Get(':id/cost')
  getCost(@Param('id') id: string) {
    return this.costingService.getBreakdown(id);
  }

  // Write = Admin only.
  @Roles(Role.ADMIN)
  @Put(':id/cost')
  setCost(@Param('id') id: string, @Body() dto: SetOrderCostDto) {
    return this.costingService.setCost(id, dto);
  }
}
