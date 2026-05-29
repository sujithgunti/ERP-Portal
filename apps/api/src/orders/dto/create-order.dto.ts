import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Priority } from '@erp/types';

export class CreateOrderDto {
  @IsString()
  @MinLength(1)
  clientId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsDateString()
  deadline!: string;

  @IsEnum(Priority)
  priority!: Priority;

  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsInt()
  gsm?: number;

  @IsOptional()
  @IsString()
  printingType?: string;

  @IsOptional()
  @IsString()
  handleType?: string;

  @IsOptional()
  @IsBoolean()
  lamination?: boolean;
}
