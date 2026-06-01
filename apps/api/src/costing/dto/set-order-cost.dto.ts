import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class MaterialLineInput {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  costPerBag!: number;
}

export class SetOrderCostDto {
  @IsOptional()
  @IsUUID()
  overheadPeriodId?: string | null;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  sellingPricePerBag?: number | null;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialLineInput)
  materialLines!: MaterialLineInput[];
}
