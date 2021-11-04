import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsOptional, Length, Matches, MaxDate } from 'class-validator';

import { EmailExist } from '../../../common/validators/email-exist.decorator';
import { StatusCode } from '../../../enums/status-code.enum';

export class UpdateUserDto {
  @Type(() => String)
  @IsOptional()
  @Length(3, 50, { context: { code: StatusCode.STRING_LENGTH } })
  fullName: string;

  @Type(() => String)
  @IsOptional()
  @IsEmail(undefined, { context: { code: StatusCode.IS_EMAIL } })
  email: string;

  @Type(() => String)
  @Transform(({ value }) => {
    const d = new Date(value);
    if (d instanceof Date && !isNaN(d.getTime()))
      return d;
    return value;
  }, { toClassOnly: true })
  @IsOptional()
  @IsDate({ context: { code: StatusCode.IS_DATE } })
  @MaxDate(new Date(), { context: { code: StatusCode.MAX_DATE } })
  birthdate: Date;

  @Type(() => String)
  @IsOptional()
  @Length(3, 200, { context: { code: StatusCode.STRING_LENGTH } })
  address: string;

  @Type(() => String)
  @IsOptional()
  currentPassword: string;

  @Type(() => String)
  @IsOptional()
  @Length(8, 128, { context: { code: StatusCode.STRING_LENGTH } })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/, { context: { code: StatusCode.MATCHES_REGEX }, message: 'password must contain at least one uppercase letter, one lowercase letter and one number' })
  password: string;

  @Transform(({ value }) => {
    if (value == undefined) return;
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  @IsOptional()
  @IsBoolean()
  requestUpgrade: boolean;

  @Transform(({ value }) => {
    if (value == undefined) return;
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  @IsOptional()
  @IsBoolean()
  upgrade: boolean;

  @Transform(({ value }) => {
    if (value == undefined) return;
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  @IsOptional()
  downgrade: boolean;

  @Transform(({ value }) => {
    if (value == undefined) return;
    return [true, 'enabled', 'true'].indexOf(value) > -1;
  })
  @IsOptional()
  banned: boolean;
}