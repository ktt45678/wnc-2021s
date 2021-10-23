import { Type } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';

import { StatusCode } from '../../../enums/status-code.enum';

export class CreateCategoryDto {
  @Type(() => String)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  @MaxLength(32)
  name: string;

  @Type(() => String)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  @MaxLength(32)
  subName: string;
}