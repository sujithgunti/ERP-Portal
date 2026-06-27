import { IsInt, Min } from 'class-validator';

export class UpdatePermissionsDto {
  @IsInt()
  @Min(0)
  tabs!: number;
}
