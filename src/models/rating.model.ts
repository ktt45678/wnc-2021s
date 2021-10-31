import { prop, plugin, Ref, modelOptions } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { RatingType } from '../enums/rating-type.enum';
import { User, Product } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
export class Rating extends TimeStamps {
  @prop()
  _id!: number;

  @prop({ required: true, ref: () => Product, type: () => Number })
  product!: Ref<Product, number>;

  @prop({ required: true, ref: () => User, type: () => Number })
  seller!: Ref<User, number>;

  @prop({ required: true, ref: () => User, type: () => Number })
  bidder!: Ref<User, number>;

  @prop({ enum: [RatingType.NEGATIVE, RatingType.POSITIVE] })
  sellerRating!: string;

  @prop({ required: true })
  sellerComment!: string;

  @prop({ enum: [RatingType.NEGATIVE, RatingType.POSITIVE] })
  bidderRating!: string;

  @prop({ required: true })
  bidderComment!: string;
}