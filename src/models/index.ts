import { getModelForClass } from '@typegoose/typegoose';

import { User } from './user.model';
import { UserRequest } from './user-request.model';
import { Category } from './category.model';
import { Product } from './product.model';
import { Bid } from './bid.model';
import { Rating } from './rating.model';

export {
  User,
  UserRequest,
  Category,
  Product,
  Bid,
  Rating
}

export const userModel = getModelForClass(User);
export const userRequestModel = getModelForClass(UserRequest);
export const categoryModel = getModelForClass(Category);
export const productModel = getModelForClass(Product);
export const bidModel = getModelForClass(Bid);
export const ratingModel = getModelForClass(Rating);