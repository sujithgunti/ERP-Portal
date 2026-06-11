import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@erp/types';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { SetMachineProductionDto } from './dto/set-machine-production.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  // ---- machines (read = all roles) ----
  @Get('machines')
  findAll() {
    return this.machinesService.findAll();
  }

  @Roles(Role.ADMIN)
  @Post('machines')
  create(@Body() dto: CreateMachineDto) {
    return this.machinesService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch('machines/:id')
  update(@Param('id') id: string, @Body() dto: UpdateMachineDto) {
    return this.machinesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('machines/:id')
  remove(@Param('id') id: string) {
    return this.machinesService.remove(id);
  }

  // ---- daily production ----
  @Get('machine-production')
  roster(@Query('date') date: string) {
    return this.machinesService.roster(date ?? new Date().toISOString());
  }

  @Get('machine-production/summary')
  summary(@Query('month') month: string, @Query('year') year: string) {
    return this.machinesService.summary(Number(month), Number(year));
  }

  @Roles(Role.ADMIN)
  @Post('machine-production')
  setProduction(@Body() dto: SetMachineProductionDto) {
    return this.machinesService.setProduction(dto);
  }
}
