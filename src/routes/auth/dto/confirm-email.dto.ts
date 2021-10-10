import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { StatusCode } from '../../../enums/status-code.enum';

export class ConfirmEmailDto {
  @Type(() => Number)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  id: number;

  @Type(() => String)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  code: string;
}