import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@erp/types';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;
}
