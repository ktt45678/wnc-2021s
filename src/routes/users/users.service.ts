import { nanoid } from 'nanoid/async';

import { userModel, User } from '../../models';
import { HttpException } from '../../common/exceptions/http.exception';
import { PaginateUserDto } from './dto/paginate-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongooseAggregation } from '../../utils/mongo-aggregation.util';
import { escapeRegExp } from '../../utils/string-helper.util';
import { Paginated } from '../../common/entities/paginated.entity';
import { AuthUser } from '../auth/entities/auth-user.entity';
import { Role } from '../../enums/role.enum';
import * as authService from '../auth/auth.service';

export const findAll = async (paginateUserDto: PaginateUserDto) => {
  const sortEnum = ['_id', 'email', 'fullName', 'birthdate', 'point', 'role'];
  const fields = { _id: 1, email: 1, fullName: 1, birthdate: 1, role: 1, point: 1, requestUpgrade: 1 };
  const { page, limit, sort, search, filter } = paginateUserDto;
  const filters: any = search ? { fullName: { $regex: escapeRegExp(search), $options: 'i' } } : {};
  filter === 1 && (filters.requestUpgrade = true);
  const aggregation = new MongooseAggregation({ page, limit, filters, fields, sortQuery: sort, sortEnum });
  const [data] = await userModel.aggregate(aggregation.build()).exec();
  return data || new Paginated();
}

export const findOne = async (id: number, authUser: AuthUser) => {
  if (id === 0 && !authUser.isGuest)
    id = authUser._id;
  let filters: any = { _id: 1, fullName: 1, role: 1, point: 1, ratingCount: 1, canSellUntil: 1, banned: 1, createdAt: 1, updatedAt: 1 };
  if (id === authUser._id || authUser.role === Role.ADMIN) {
    filters = {
      _id: 1, email: 1, fullName: 1, birthdate: 1, address: 1, role: 1, point: 1, ratingCount: 1, requestUpgrade: 1,
      canSellUntil: 1, banned: 1, activated: 1, createdAt: 1, updatedAt: 1
    };
  }
  const user = await userModel.findById(id, filters).lean().exec();
  if (!user)
    throw new HttpException({ status: 404, message: 'Người dùng không tồn tại' });
  return user;
}

export const update = async (id: number, updateUserDto: UpdateUserDto, authUser: AuthUser) => {
  const user = await userModel.findById(id, {
    _id: 1, email: 1, fullName: 1, birthdate: 1, address: 1, role: 1, point: 1, ratingCount: 1, requestUpgrade: 1, canSellUntil: 1, banned: 1,
    activated: 1, activationCode: 1, password: 1, createdAt: 1, updatedAt: 1
  }).exec();
  if (!user)
    throw new HttpException({ status: 404, message: 'Người dùng không tồn tại' });
  let authChanged = false;
  if (user._id === authUser._id) {
    if (updateUserDto.currentPassword != undefined && !(await authService.comparePassword(updateUserDto.currentPassword, user.password)))
      throw new HttpException({ status: 400, message: 'Mật khẩu hiện tại không chính xác' });
    updateUserDto.fullName != undefined && (user.fullName = updateUserDto.fullName);
    updateUserDto.birthdate != undefined && (user.birthdate = updateUserDto.birthdate);
    updateUserDto.address != undefined && (user.address = updateUserDto.address);
    updateUserDto.requestUpgrade != undefined && (user.requestUpgrade = updateUserDto.requestUpgrade);
    if (updateUserDto.email != undefined && user.email !== updateUserDto.email) {
      if (updateUserDto.currentPassword == undefined)
        throw new HttpException({ status: 400, message: 'Mật khẩu hiện tại không chính xác' });
      user.email = updateUserDto.email;
      user.activated = false;
      user.activationCode = await nanoid();
      await authService.sendConfirmationEmail(user, user.activationCode);
      authChanged = true;
    }
    if (updateUserDto.password != undefined) {
      if (updateUserDto.currentPassword == undefined)
        throw new HttpException({ status: 400, message: 'Mật khẩu hiện tại không chính xác' });
      user.password = await authService.hashPassword(updateUserDto.password);
      authChanged = true;
    }
  } else if (authUser.role === Role.ADMIN) {
    updateUserDto.fullName != undefined && (user.fullName = updateUserDto.fullName);
    updateUserDto.birthdate != undefined && (user.birthdate = updateUserDto.birthdate);
    updateUserDto.address != undefined && (user.address = updateUserDto.address);
    updateUserDto.email != undefined && (user.email = updateUserDto.email);
    updateUserDto.banned != undefined && (user.banned = updateUserDto.banned);
    updateUserDto.requestUpgrade != undefined && (user.requestUpgrade = updateUserDto.requestUpgrade);
    if (updateUserDto.upgrade) {
      user.role = Role.SELLER;
      user.canSellUntil = new Date(Date.now() + 604800000);
      user.requestUpgrade = false;
    }
    if (updateUserDto.downgrade) {
      user.role = Role.BIDDER;
      user.canSellUntil = new Date();
      user.requestUpgrade = false;
    }
  } else {
    throw new HttpException({ status: 403, message: 'Bạn không có quyền cập nhật người dùng này' });
  }
  await user.save();
  const result: any = user.toObject();
  if (authChanged) {
    const tokens = await authService.createJwtToken(result);
    result.accessToken = tokens.accessToken;
    result.refreshToken = tokens.refreshToken;
  }
  result.activationCode = undefined;
  result.password = undefined;
  return result;
}
