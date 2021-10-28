import { Document, startSession } from 'mongoose';
import slugify from 'slugify';
import { plainToClassFromExist } from 'class-transformer';

import { productModel, categoryModel, Product } from '../../models';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginateProductDto } from './dto/paginate-product.dto';
import { HttpException } from '../../common/exceptions/http.exception';
import { AuthUser } from '../auth/entities/auth-user.entity';
import { MulterFile } from '../../common/interfaces/multer-file.interface';
import { LookupOptions, MongooseAggregation } from '../../utils/mongo-aggregation.util';
import { STATIC_DIR, STATIC_URL } from '../../config';
import { Paginated } from '../../common/entities/paginated.entity';

export const create = async (authUser: AuthUser, createProductDto: CreateProductDto, files: MulterFile[]) => {
  const { name, description, category, startingPrice, priceStep, buyPrice, autoRenew, expiry } = createProductDto;
  let newProduct: Document<Product>;
  const session = await startSession();
  await session.withTransaction(async () => {
    const product = new productModel({ name, description, category, startingPrice, priceStep, buyPrice, autoRenew, expiry });
    product.slug = slugify(name, { lower: true });
    product.images = files.map(file => file.filename);
    const selectedCategory = await categoryModel.findById(category);
    if (!selectedCategory)
      throw new HttpException({ status: 404, message: 'Không tìm thấy danh mục đã chọn' });
    product.seller = authUser._id;
    newProduct = await product.save({ session });
    selectedCategory.products.push(newProduct._id);
    await selectedCategory.save({ session });
  });
  return newProduct.toObject();
}

export const findAll = async (paginateProductDto: PaginateProductDto) => {
  console.log(paginateProductDto);
  const sortEnum = ['_id', 'name', 'category', 'startingPrice', 'priceStep', 'buyPrice', 'displayPrice', 'seller', 'winner',
    'bidCount', 'expiry', 'createdAt', 'updatedAt'];
  const fields = {
    _id: 1, name: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, displayPrice: 1, autoRenew: 1, seller: 1,
    winner: 1, bidCount: 1, expiry: 1, createdAt: 1, updatedAt: 1
  };
  const { page, limit, sort, search, category, ended, seller, winner } = paginateProductDto;
  const filters: any = { deleted: false };
  category != undefined && (filters.category = category);
  ended != undefined && ended ? filters.expiry = { $lt: new Date() } : filters.expiry = { $gte: new Date() };
  seller != undefined && (filters.seller = seller);
  winner != undefined && (filters.winner = winner);
  const aggregation = new MongooseAggregation({ page, limit, filters, fields, sortQuery: sort, search, sortEnum, fullTextSearch: true });
  const lookups: LookupOptions[] = [{
    from: 'categories', localField: 'category', foreignField: '_id', as: 'category', isArray: false,
    project: { _id: 1, name: 1, subName: 1 }
  }, {
    from: 'users', localField: 'seller', foreignField: '_id', as: 'seller', isArray: false,
    project: { _id: 1, fullName: 1 }
  }, {
    from: 'users', localField: 'winner', foreignField: '_id', as: 'winner', isArray: false,
    project: { _id: 1, fullName: 1 }
  }];
  const [data] = await productModel.aggregate(aggregation.buildLookup(lookups)).exec();
  if (data) {
    for (let i = 0; i < data.results.length; i++) {
      if (data.results[i].images.length) {
        for (let j = 0; j < data.results[i].images.length; j++) {
          data.results[i].images[j] = `${STATIC_URL}${STATIC_DIR}/${data.results[i].images[j]}`;
        }
      }
    }
  }
  return data || new Paginated();
}