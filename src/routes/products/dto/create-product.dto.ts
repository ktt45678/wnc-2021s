import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, Length, Max, MaxLength, Min, MinDate } from 'class-validator';

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
  @IsNumber()
  category: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100_000_000_000)
  startingPrice: number;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100_000_000_000)
  priceStep: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100_000_000_000)
  buyPrice: number;

  @Type(() => Boolean)
  @IsNotEmpty()
  @IsBoolean()
  autoRenew: boolean;

  @Type(() => String)
  @Transform(({ value }) => {
    const d = new Date(value);
    if (d instanceof Date && !isNaN(d.getTime()))
      return d;
    return value;
  }, { toClassOnly: true })
  @IsDate()
  @MinDate(new Date())
  expiry: Date;
}