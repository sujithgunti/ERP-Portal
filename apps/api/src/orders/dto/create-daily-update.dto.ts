import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ProductionStage } from '@erp/types';

export class CreateDailyUpdateDto {
  @IsEnum(ProductionStage)
  stage!: ProductionStage;

  @IsInt()
  @Min(0)
  quantityCompleted!: number;

  @IsInt()
  @Min(0)
  quantityPending!: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
