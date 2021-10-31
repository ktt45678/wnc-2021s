import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DenyBidDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  user: number;
}