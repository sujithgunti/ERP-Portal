import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReportsService } from './reports.service';

// Reports are read-only; all authenticated roles may view.
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('orders')
  orders(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.orders(from, to);
  }

  @Get('expenses')
  expenses(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.expenses(from, to);
  }

  @Get('work-efficiency')
  workEfficiency(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.workEfficiency(from, to);
  }
}
