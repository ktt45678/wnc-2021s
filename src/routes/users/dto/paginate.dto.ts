import { Type } from 'class-transformer';
import { IsInt, IsOptional, Length, Matches, Max, Min } from 'class-validator';

export class PaginateDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Max(5000)
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Max(50)
  @Min(1)
  limit: number = 30;

  @Type(() => String)
  @IsOptional()
  @Length(1, 250)
  search: string;

  @Type(() => String)
  @IsOptional()
  @Length(5, 250)
  @Matches(/^(?:(?:asc|desc)(?:\([\w\.]+(?:,[\w\.]+)*\)))+(?:,(?:asc|desc)(?:\([\w\.]+(?:,[\w\.]+)*\)))*$/, { message: 'sort query must be valid' })
  sort: string;
}