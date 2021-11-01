import { prop, plugin, Ref, modelOptions, index } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { RatingType } from '../enums/rating-type.enum';
import { User, Product } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
@index({ product: 1, user: 1 })
@index({ target: 1, type: 1, createdAt: -1 })
export class Rating extends TimeStamps {
  @prop()
  _id!: number;

  @prop({ required: true, ref: () => Product, type: () => Number })
  product!: Ref<Product, number>;

  @prop({ required: true, ref: () => User, type: () => Number })
  user!: Ref<User, number>;

  @prop({ required: true, ref: () => User, type: () => Number })
  target!: Ref<User, number>;

  @prop({ required: true, enum: [RatingType.NEGATIVE, RatingType.POSITIVE] })
  type!: number;

  @prop()
  comment!: string;
}