import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@erp/types';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
