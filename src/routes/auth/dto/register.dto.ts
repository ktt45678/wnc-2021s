import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, Length, Matches, MaxDate } from 'class-validator';

import { EmailExist } from '../../../common/validators/email-exist.decorator';

export class RegisterDto {
  @Type(() => String)
  @Length(3, 50)
  fullName: string;

  @Type(() => String)
  @IsEmail()
  @EmailExist()
  email: string;

  @Type(() => String)
  @Transform(({ value }) => {
    const d = new Date(value);
    if (d instanceof Date && !isNaN(d.getTime()))
      return d;
    return value;
  }, { toClassOnly: true })
  @IsDate()
  @MaxDate(new Date())
  birthdate: Date;

  @Type(() => String)
  @IsNotEmpty()
  address: string;

  @Type(() => String)
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/, { message: 'password must contain at least one uppercase letter, one lowercase letter and one number' })
  password: string;
}