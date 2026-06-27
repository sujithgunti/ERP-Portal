import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TabGuard } from '../auth/guards/tab.guard';
import { RequireTab } from '../auth/decorators/require-tab.decorator';
import { TAB } from '@erp/types';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard, TabGuard)
@RequireTab(TAB.DASHBOARD)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // All authenticated roles can view the dashboard.
  @Get()
  summary() {
    return this.dashboardService.summary();
  }
}
