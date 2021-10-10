import { Type } from 'class-transformer';
import { IsNotEmpty, Length, Matches } from 'class-validator';

import { StatusCode } from '../../../enums/status-code.enum';

export class ResetPasswordDto {
  @Type(() => Number)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  id: number;

  @Type(() => String)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  code: string;

  @Type(() => String)
  @Length(8, 128, { context: { code: StatusCode.STRING_LENGTH } })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/, { context: { code: StatusCode.MATCHES_REGEX }, message: 'password must contain at least one uppercase letter, one lowercase letter and one number' })
  password: string;
}