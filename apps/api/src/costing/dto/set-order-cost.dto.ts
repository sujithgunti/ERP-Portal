import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
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
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  overheadPerBag?: number | null;

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
