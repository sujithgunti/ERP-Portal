import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@erp/types';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExpensesService } from './expenses.service';
import { CreateExpensePeriodDto } from './dto/create-expense-period.dto';
import { UpdateExpensePeriodDto } from './dto/update-expense-period.dto';
import { CreateExpenseItemDto } from './dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from './dto/update-expense-item.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // ---- periods (read = all roles) ----
  @Get('periods')
  findAllPeriods() {
    return this.expensesService.findAllPeriods();
  }

  @Get('periods/:id')
  findPeriod(@Param('id') id: string) {
    return this.expensesService.findPeriod(id);
  }

  // ---- writes = Admin only ----
  @Roles(Role.ADMIN)
  @Post('periods')
  createPeriod(@Body() dto: CreateExpensePeriodDto) {
    return this.expensesService.createPeriod(dto);
  }

  @Roles(Role.ADMIN)
  @Patch('periods/:id')
  updatePeriod(@Param('id') id: string, @Body() dto: UpdateExpensePeriodDto) {
    return this.expensesService.updatePeriod(id, dto);
  }

  @Roles(Role.ADMIN)
  @Post('periods/:id/items')
  addItem(@Param('id') id: string, @Body() dto: CreateExpenseItemDto) {
    return this.expensesService.addItem(id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch('items/:id')
  updateItem(@Param('id') id: string, @Body() dto: UpdateExpenseItemDto) {
    return this.expensesService.updateItem(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.expensesService.removeItem(id);
  }
}
