import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role, TAB } from '@erp/types';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TabGuard } from '../auth/guards/tab.guard';
import { RequireTab } from '../auth/decorators/require-tab.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@UseGuards(JwtAuthGuard, RolesGuard, TabGuard)
@RequireTab(TAB.ATTENDANCE)
@Controller()
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  // ---- workers (read = all roles) ----
  @Get('workers')
  findAll() {
    return this.workersService.findAll();
  }

  @Roles(Role.ADMIN)
  @Post('workers')
  create(@Body() dto: CreateWorkerDto) {
    return this.workersService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch('workers/:id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.workersService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('workers/:id')
  remove(@Param('id') id: string) {
    return this.workersService.remove(id);
  }

  // ---- attendance ----
  @Get('attendance')
  roster(@Query('date') date: string) {
    return this.workersService.roster(date ?? new Date().toISOString());
  }

  @Get('attendance/summary')
  summary(@Query('month') month: string, @Query('year') year: string) {
    return this.workersService.summary(Number(month), Number(year));
  }

  @Roles(Role.ADMIN)
  @Post('attendance')
  mark(@Body() dto: MarkAttendanceDto) {
    return this.workersService.mark(dto);
  }
}
