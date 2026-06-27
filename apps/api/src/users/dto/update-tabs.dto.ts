import { IsInt, Min } from 'class-validator';

export class UpdateTabsDto {
  @IsInt()
  @Min(0)
  tabs!: number;
}
