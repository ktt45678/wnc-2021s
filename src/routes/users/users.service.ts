import { LeanDocument } from 'mongoose';
import { plainToClass } from 'class-transformer';

import { userModel, User } from '../../models';
import { HttpException } from '../../common/exceptions/http.exception';
import { PaginateDto } from './dto/paginate.dto';
import { MongooseAggregation } from '../../utils/mongo-aggregation.util';
import { escapeRegExp } from '../../utils/string-helper.util';

export const findAll = async (paginateDto: PaginateDto) => {
  const sortEnum = ['_id', 'email', 'fullName', 'point', 'requestUpgrade'];
  const fields = { _id: 1, email: 1, fullName: 1, role: 1, point: 1, requestUpgrade: 1 };
  const { page, limit, sort, search } = paginateDto;
  const filters = search ? { name: { $regex: escapeRegExp(search), $options: 'i' } } : {};
  const aggregation = new MongooseAggregation({ page, limit, filters, fields, sortQuery: sort, sortEnum });
  const [data] = await userModel.aggregate(aggregation.build()).exec();
  return data;
}

export const findOne = async (id: number) => {

}

export const update = async (id: number, createCategoryDto: PaginateDto) => {

}

export const remove = async (id: number) => {

}