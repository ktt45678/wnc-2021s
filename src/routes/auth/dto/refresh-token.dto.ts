import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { StatusCode } from '../../../enums/status-code.enum';

export class RefreshTokenDto {
  @Type(() => String)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  token: string;
}