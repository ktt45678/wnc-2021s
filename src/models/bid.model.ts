import { prop, plugin, modelOptions, Ref, index } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { BidStatus } from '../enums/bid-status.enum';
import { Product, User } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
@index({ product: 1, bidder: 1 })
@index({ product: 1, status: 1, price: -1 })
export class Bid extends TimeStamps {
  @prop()
  _id?: number;

  @prop({ required: true, ref: () => Product, type: () => Number })
  product!: Ref<Product, number>;

  @prop({ required: true, ref: () => User, type: () => Number })
  bidder!: Ref<User, number>;

  @prop({ required: true, min: 0 })
  price!: number;

  @prop({ required: true, enum: [BidStatus.REVIEW, BidStatus.ACCEPTED, BidStatus.DENIED] })
  status!: string;
}