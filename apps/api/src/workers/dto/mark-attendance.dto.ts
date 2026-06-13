import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '@erp/types';

export class MarkAttendanceDto {
  @IsUUID()
  workerId!: string;

  @IsDateString()
  date!: string; // YYYY-MM-DD

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  checkIn?: string | null;

  @IsOptional()
  @IsString()
  checkOut?: string | null;

  @IsOptional()
  @IsString()
  note?: string;
}
