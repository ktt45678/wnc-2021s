import { nanoid } from 'nanoid/async';
import bcrypt from 'bcrypt';
import { classToPlain, plainToClass } from 'class-transformer';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { JWT } from './entities/jwt.entity';
import { userModel, User } from '../../models';
import { Role } from '../../enums/role.enum';
import { AccountType } from '../../enums/account-type.enum';
import { SIBTemplate } from '../../enums/sendinblue-template.enum';
import { StatusCode } from '../../enums/status-code.enum';
import { HttpException } from '../../common/exceptions/http.exception';
import { signJwtAsync, verifyJwtAsync } from '../../utils/jwt.util';
import { sendEmailSIB } from '../../modules/email.module';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME, WEBSITE_URL } from '../../config';

export const createAccount = async (registerDto: RegisterDto) => {
  const hashedPassword = await hashPassword(registerDto.password);
  const code = await nanoid();
  const user = new userModel({
    fullName: registerDto.fullName,
    email: registerDto.email,
    birthdate: registerDto.birthdate,
    address: registerDto.address,
    password: hashedPassword,
    role: Role.USER,
    activationCode: code,
    accountType: AccountType.BIDDER
  });
  await user.save();
  // Transform a plain object into a class instance
  // This would allow us to perform serialization on some properties by using class-transformer
  // See: https://github.com/typestack/class-transformer
  const transformedUser = plainToClass(User, user.toObject());
  await sendConfirmationEmail(transformedUser, transformedUser.activationCode);
  return createJwtToken(transformedUser);
}

export const authenticate = async (loginDto: LoginDto) => {
  const user = await findByEmail(loginDto.email);
  if (!user || !(await comparePassword(loginDto.password, user.password)))
    throw new HttpException({ status: 400, message: 'Incorrect email or password', code: StatusCode.INCORRECT_LOGIN });
  const transform = plainToClass(User, user);
  return createJwtToken(transform);
}

export const createJwtToken = async (user: User) => {
  const payload = {
    _id: user._id,
    email: user.email,
    birthdate: user.birthdate,
    fullName: user.fullName,
    role: user.role,
    activated: user.activated,
    point: user.point,
    accountType: user.accountType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
  const [accessToken, refreshToken] = await Promise.all([
    signJwtAsync(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME }),
    signJwtAsync(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFETIME })
  ]);
  const jwt = plainToClass(JWT, { accessToken, refreshToken });
  return jwt;
}

export const verifyAccessToken = async (accessToken: string) => {
  try {
    const payload = await verifyJwtAsync<User>(accessToken, ACCESS_TOKEN_SECRET);
    return payload;
  } catch {
    throw new HttpException({ status: 400, message: 'Unauthorized', code: StatusCode.UNAUTHORIZED });
  }
}

export const sendConfirmationEmail = async (user: User, activationCode?: string) => {
  if (user.activated)
    throw new HttpException({ status: 422, message: 'User has already been activated', code: StatusCode.USER_ALREADY_ACTIVATED });
  // Generate a new activation code if not given
  if (!activationCode) {
    activationCode = await nanoid();
    user = await userModel.findByIdAndUpdate(user._id, { activationCode }, { new: true }).lean().exec();
  }
  return sendEmailSIB(user.email, user.fullName, SIBTemplate.CONFIRM_EMAIL, {
    recipient_name: user.fullName,
    button_url: `${WEBSITE_URL}/confirm-email?id=${user._id}&code=${activationCode}`
  });
}

export const confirmEmail = async (confirmEmailDto: ConfirmEmailDto) => {
  const { id, code } = confirmEmailDto;
  const user = await userModel.findOneAndUpdate({ $and: [{ _id: id }, { activationCode: code }] },
    { $unset: { activationCode: 1 }, $set: { activated: true } }, { new: true })
    .select({ password: 0, activationCode: 0, recoveryCode: 0 })
    .lean().exec();
  if (!user)
    throw new HttpException({ status: 404, message: 'Activation code not found', code: StatusCode.ACTIVATION_CODE_NOT_FOUND });
  return createJwtToken(user);
}

const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
}

const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
}

export const findByEmail = (email: string) => {
  return userModel.findOne({ email }).lean().exec();
}