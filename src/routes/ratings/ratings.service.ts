import { ratingModel } from '../../models';
import { PaginateRatingDto } from './dto/paginate-rating.dto';
import { LookupOptions, MongooseAggregation } from '../../utils/mongo-aggregation.util';
import { Paginated } from '../../common/entities/paginated.entity';
import { AuthUser } from '../auth/entities/auth-user.entity';

export const findAll = async (paginateRatingDto: PaginateRatingDto, authUser: AuthUser) => {
  const sortEnum = ['_id', 'createdAt'];
  const fields = { _id: 1, product: 1, user: 1, type: 1, comment: 1, createdAt: 1 };
  if (paginateRatingDto.target === 0 && !authUser.isGuest)
    paginateRatingDto.target = authUser._id;
  const { page, limit, sort, target } = paginateRatingDto;
  const filters: any = {};
  target != undefined && (filters.target = target);
  const aggregation = new MongooseAggregation({ page, limit, filters, fields, sortQuery: sort, sortEnum });
  const lookups: LookupOptions[] = [
    { from: 'products', localField: 'product', foreignField: '_id', as: 'product', project: { _id: 1, name: 1 }, isArray: false },
    { from: 'users', localField: 'user', foreignField: '_id', as: 'user', project: { _id: 1, fullName: 1 }, isArray: false }
  ];
  const [data] = await ratingModel.aggregate(aggregation.buildLookup(lookups)).exec();
  return data || new Paginated();
}
