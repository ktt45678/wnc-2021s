import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { ConfirmEmailDto } from '../../dto/confirm-email.dto';
import { userModel, User } from '../../../../models';
import { Role } from '../../../../enums/role.enum';
import { AccountType } from '../../../../enums/account-type.enum';
import { StatusCode } from '../../../../enums/status-code.enum';
import { HttpException } from '../../../../common/exceptions/http.exception';
import * as authService from '../../auth.service';

export const createAccount = async (registerDto: RegisterDto) => {
  const user = await userModel.findOne({ role: Role.ADMIN }).lean().exec();
  if (user)
    throw new HttpException({ status: 422, message: 'Admin account has already beed created', code: StatusCode.ADMIN_ADREADY_CREATED });
  return authService.createAccount(registerDto, Role.ADMIN, AccountType.ADMIN);
}

export const authenticate = (loginDto: LoginDto) => {
  return authService.authenticate(loginDto, Role.ADMIN);
}