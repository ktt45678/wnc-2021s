import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import axios from '../../modules/axios.module';
import { RECAPTCHA_SECRET, DISABLE_RECAPTCHA } from '../../config';

@ValidatorConstraint({ async: true })
export class ReCaptchaConstraint implements ValidatorConstraintInterface {
  async validate(key: any) {
    if (DISABLE_RECAPTCHA)
      return true;
    try {
      const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${key}`);
      if (response.data.success)
        return true;
      return false;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid`;
  }
}

export function ReCaptcha(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ReCaptchaConstraint,
    });
  };
}