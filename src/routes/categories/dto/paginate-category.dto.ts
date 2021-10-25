import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

import { PaginateDto } from '../../users/dto/paginate.dto';

export class PaginateCategoryDto extends PaginateDto {
  @Type(() => Number)
  @IsOptional()
  responseType: number = 0;
}