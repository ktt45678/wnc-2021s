import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class BidProductDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1_000)
  @Max(100_000_000_000)
  price: number;
}