import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class SetMachineProductionDto {
  @IsUUID()
  machineId!: string;

  @IsDateString()
  date!: string; // YYYY-MM-DD

  @IsInt()
  @Min(0)
  bagsProduced!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
