import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMachineDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
