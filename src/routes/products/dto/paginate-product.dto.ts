import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

import { PaginateDto } from '../../users/dto/paginate.dto';

export class PaginateProductDto extends PaginateDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  category: number;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  ended: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  seller: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  winner: number;
}