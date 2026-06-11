import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ExpenseDirection } from '@erp/types';

export class CreateDailyExpenseDto {
  @IsDateString()
  date!: string;

  @IsEnum(ExpenseDirection)
  direction!: ExpenseDirection;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
