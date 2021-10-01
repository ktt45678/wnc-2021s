import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @Type(() => String)
  @IsEmail()
  email: string;

  @Type(() => String)
  @IsNotEmpty()
  password: string;
}