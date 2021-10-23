import { LeanDocument } from 'mongoose';
import { plainToClass } from 'class-transformer';

import { categoryModel, Category } from '../../models';
import { HttpException } from '../../common/exceptions/http.exception';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PaginateCategoryDto } from './dto/paginate-category.dto';
import { escapeRegExp } from '../../utils/string-helper.util';
import { MongooseAggregation } from '../../utils/mongo-aggregation.util';
import { Paginated } from '../../common/entities/paginated.entity';

export const create = async (createCategoryDto: CreateCategoryDto) => {
  const { name, subName } = createCategoryDto;
  const checkCategory = await categoryModel.findOne({ $and: [{ name }, { subName }] }).lean().exec();
  if (checkCategory)
    throw new HttpException({ status: 400, message: 'Danh mục này đã tồn tại' });
  const category = new categoryModel({ name, subName });
  const newCategory = await category.save();
  return newCategory.toObject();
}

export const findAll = async (paginateCategoryDto: PaginateCategoryDto) => {
  const sortEnum = ['_id', 'name', 'subName', 'createdAt'];
  const fields = { _id: 1, name: 1, subName: 1, createdAt: 1, products: 1 };
  const { page, limit, sort, search } = paginateCategoryDto;
  const filters: any = search ? {
    $or: [
      { name: { $regex: escapeRegExp(search), $options: 'i' } },
      { subName: { $regex: escapeRegExp(search), $options: 'i' } }
    ]
  } : {};
  const aggregation = new MongooseAggregation({ page, limit, filters, fields, sortQuery: sort, sortEnum });
  const [data] = await categoryModel.aggregate(aggregation.build()).exec();
  return data || new Paginated();
  /*
  return categoryModel.aggregate([
    {
      $group: { _id: '$name', children: { $push: { name: '$subName', _id: '$_id' } } }
    }
  ]).exec();
  */
}

export const findOne = async (id: number) => {
  return categoryModel.findById(id).lean().exec();
}

export const update = async (id: number, createCategoryDto: CreateCategoryDto) => {
  const { name, subName } = createCategoryDto;
  const category = await categoryModel.findByIdAndUpdate(id, { name, subName }, { new: true }).lean().exec();
  if (!category)
    throw new HttpException({ status: 404, message: 'Không tìm thấy danh mục này' });
  return category;
}

export const remove = async (id: number) => {
  const category = await categoryModel.findById(id).lean().exec();
  if (!category)
    throw new HttpException({ status: 404, message: 'Không tìm thấy danh mục này' });
  if (category.products.length)
    throw new HttpException({ status: 422, message: 'Không thể xóa danh mục đang chứa sản phẩm' });
  await categoryModel.deleteOne({ _id: id }).exec();
}