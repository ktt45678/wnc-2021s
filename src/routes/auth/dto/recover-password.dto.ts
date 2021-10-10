import { Type } from 'class-transformer';
import { IsEmail } from 'class-validator';

import { StatusCode } from '../../../enums/status-code.enum';

export class RecoverPasswordDto {
  @Type(() => String)
  @IsEmail(undefined, { context: { code: StatusCode.IS_EMAIL } })
  email: string;
}