import { LeanDocument } from 'mongoose';
import { plainToClass } from 'class-transformer';

import { userModel, User } from '../../models';
import { HttpException } from '../../common/exceptions/http.exception';
import { PaginateUserDto } from './dto/paginate-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongooseAggregation } from '../../utils/mongo-aggregation.util';
import { escapeRegExp } from '../../utils/string-helper.util';
import { Paginated } from '../../common/entities/paginated.entity';
import { AuthUser } from '../auth/entities/auth-user.entity';

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
  const user = await userModel.findById(id, {
    _id: 1, email: 1, fullName: 1, birthdate: 1, address: 1, role: 1, point: 1, ratings: 1, requestUpgrade: 1, canSellUntil: 1
  }).populate('ratings').lean().exec();
  if (!user)
    throw new HttpException({ status: 404, message: 'User not found' });
  return user;
}

export const update = async (id: number, updateUserDto: UpdateUserDto) => {

}

export const remove = async (id: number) => {

}