import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateExpensePeriodDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalBagsProduced?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
