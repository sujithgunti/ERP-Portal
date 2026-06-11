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
import { Role } from '@erp/types';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExpensesService } from './expenses.service';
import { CreateDailyExpenseDto } from './dto/create-daily-expense.dto';
import { UpdateDailyExpenseDto } from './dto/update-daily-expense.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // ---- reads (all roles) ----
  @Get()
  recent(@Query('days') days?: string) {
    return this.expensesService.findRecent(days ? Number(days) : 30);
  }

  @Get('day')
  day(@Query('date') date: string) {
    return this.expensesService.findDay(date);
  }

  // ---- writes (Admin only) ----
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateDailyExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDailyExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
