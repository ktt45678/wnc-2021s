import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, Length, Max, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @Type(() => String)
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @Type(() => String)
  @IsNotEmpty()
  @Length(10, 10000)
  description: string;

  @Type(() => Number)
  @IsNotEmpty()
  category: number;

  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  @Max(100_000_000_000)
  startingPrice: number;

  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  @Max(100_000_000_000)
  priceStep: number;

  @Type(() => Number)
  @IsOptional()
  @Min(0)
  @Max(100_000_000_000)
  buyPrice: number;

  @Type(() => Boolean)
  @IsBoolean()
  autoRenew: boolean;

  @Type(() => Number)
  @IsNotEmpty()
  // 5m, 30m, 1h, 12h, 1d, 3d, 5d, 7d
  @IsIn([300, 1800, 3600, 43200, 86400, 259200, 432000, 604800])
  duration: number;
}