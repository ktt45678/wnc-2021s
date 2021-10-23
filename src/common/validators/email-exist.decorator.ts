import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { findByEmail } from '../../routes/auth/auth.service';

@ValidatorConstraint({ async: true })
export class EmailExistConstraint implements ValidatorConstraintInterface {
  async validate(email: any) {
    const user = await findByEmail(email);
    if (user)
      return false;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} đã được sử dụng`;
  }
}

export function EmailExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailExistConstraint,
    });
  };
}