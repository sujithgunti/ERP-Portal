import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ExpenseCategory } from '@erp/types';

export class CreateExpenseItemDto {
  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
