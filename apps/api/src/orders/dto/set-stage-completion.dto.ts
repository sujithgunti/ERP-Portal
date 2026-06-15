import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductionStage } from '@erp/types';

export class SetStageCompletionDto {
  @IsEnum(ProductionStage)
  stage!: ProductionStage;

  @IsBoolean()
  completed!: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}
