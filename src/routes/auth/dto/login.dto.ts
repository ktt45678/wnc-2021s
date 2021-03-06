import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

import { StatusCode } from '../../../enums/status-code.enum';

export class LoginDto {
  @Type(() => String)
  @IsEmail(undefined, { context: { code: StatusCode.IS_EMAIL } })
  email: string;

  @Type(() => String)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  password: string;
}