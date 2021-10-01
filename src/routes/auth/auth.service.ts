import { nanoid } from 'nanoid/async';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { classToPlain, plainToClass } from 'class-transformer';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JWT } from './entities/jwt.entity';
import { userModel, User } from '../../models';
import { Role } from '../../enums/role.enum';
import { AccountType } from '../../enums/account-type.enum';
import { HttpException } from '../../common/exceptions/http.exception';
import { signJwtAsync, verifyJwtAsync } from '../../utils/jwt.util';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME } from '../../config';

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
  const transform = plainToClass(User, user.toObject())
  return createJwtToken(transform);
}

export const authenticate = async (loginDto: LoginDto) => {
  const user = await findByEmail(loginDto.email);
  if (!user || !(await comparePassword(loginDto.password, user.password)))
    throw new HttpException({ status: 400, message: 'Incorrect email or password', code: 'INCORRECT_LOGIN' });
  const transform = plainToClass(User, user);
  return createJwtToken(transform);
}

export const createJwtToken = async (user: User) => {
  const payload = classToPlain(user);
  const [accessToken, refreshToken] = await Promise.all([
    signJwtAsync(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_LIFETIME }),
    signJwtAsync(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_LIFETIME })
  ]);
  const jwt = plainToClass(JWT, { accessToken, refreshToken });
  return jwt;
}

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
}

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
}

export const findByEmail = (email: string) => {
  return userModel.findOne({ email }).lean().exec();
}