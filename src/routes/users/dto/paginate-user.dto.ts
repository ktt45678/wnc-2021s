import { Type } from 'class-transformer';
import { IsOptional, Length } from 'class-validator';

import { PaginateDto } from './paginate.dto';

export class PaginateUserDto extends PaginateDto {
  @Type(() => Number)
  @IsOptional()
  filter: number = 0;
}