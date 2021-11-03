import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { PaginateDto } from '../../users/dto/paginate.dto';

export class PaginateRatingDto extends PaginateDto {
  @Type(() => Number)
  @IsOptional()
  target: number = 0;
}