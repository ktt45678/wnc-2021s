import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

import { PaginateDto } from '../../users/dto/paginate.dto';

export class PaginateProductDto extends PaginateDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  category: number;

  @Transform(({ value }) => {
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
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

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  except: number;
}