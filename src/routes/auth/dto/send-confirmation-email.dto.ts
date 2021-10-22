import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { ReCaptcha } from '../../../common/validators/recaptcha.decorator';
import { StatusCode } from '../../../enums/status-code.enum';

export class SendConfirmationEmailDto {
  @Type(() => String)
  @IsNotEmpty({ context: { code: StatusCode.NOT_EMPTY } })
  @ReCaptcha({ context: { code: StatusCode.INVALID_RECAPTCHA } })
  reCaptcha: string;
}