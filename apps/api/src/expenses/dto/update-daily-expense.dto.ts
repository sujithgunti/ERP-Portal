import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyExpenseDto } from './create-daily-expense.dto';

export class UpdateDailyExpenseDto extends PartialType(CreateDailyExpenseDto) {}
