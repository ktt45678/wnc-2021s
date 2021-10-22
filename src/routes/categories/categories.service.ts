import { LeanDocument } from 'mongoose';
import { plainToClass } from 'class-transformer';

import { categoryModel, Category } from '../../models';
import { HttpException } from '../../common/exceptions/http.exception';
import { CreateCategoryDto } from './dto/create-category.dto';

export const create = async (createCategoryDto: CreateCategoryDto) => {
  const { name, subName } = createCategoryDto;
  const category = new categoryModel({ name, subName });
  const newCategory = await category.save();
  return newCategory.toObject();
}

export const findAll = () => {
  return categoryModel.aggregate([
    {
      $group: { _id: '$name', children: { $push: { name: '$subName', _id: '$_id' } } }
    }
  ]).exec();
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