import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, Length, Matches, MaxDate } from 'class-validator';

import { EmailExist } from '../../../common/validators/email-exist.decorator';
import { ReCaptcha } from '../../../common/validators/recaptcha.decorator';
import { StatusCode } from '../../../enums/status-code.enum';

export class RegisterDto {
  @Type(() => String)
  @Length(3, 50, { context: { code: StatusCode.STRING_LENGTH } })
  fullName: string;

  @Type(() => String)
  @IsEmail(undefined, { context: { code: StatusCode.IS_EMAIL } })
  @EmailExist({ context: { code: StatusCode.EMAIL_USED } })
  email: string;

  @Type(() => String)
  @Transform(({ value }) => {
    const d = new Date(value);
    if (d instanceof Date && !isNaN(d.getTime()))
      return d;
    return value;
  }, { toClassOnly: true })
  @IsDate({ context: { code: StatusCode.IS_DATE } })
  @MaxDate(new Date(), { context: { code: StatusCode.MAX_DATE } })
  birthdate: Date;

  @Type(() => String)
  @Length(3, 200, { context: { code: StatusCode.STRING_LENGTH } })
  address: string;

  @Type(() => String)
  @Length(8, 128, { context: { code: StatusCode.STRING_LENGTH } })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/, { context: { code: StatusCode.MATCHES_REGEX }, message: 'password must contain at least one uppercase letter, one lowercase letter and one number' })
  password: string;

  @Type(() => String)
  @ReCaptcha({ context: { code: StatusCode.INVALID_RECAPTCHA } })
  recaptcha: string;
}