import { prop, plugin, modelOptions, Ref, mongoose } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { Exclude, Expose } from 'class-transformer';

import { UserGroup } from '../enums/user-group.enum';
import { Bid, Category, User } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
export class Product extends TimeStamps {
  @prop()
  _id?: number;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  description!: string;

  @prop({ required: true, ref: () => Category })
  category!: Ref<Category>;

  @prop({ type: () => [String], required: true, default: [] })
  images!: string[];

  @prop({ required: true, min: 0 })
  startingPrice!: number;

  @prop({ required: true, min: 0 })
  priceStep!: number;

  @prop({ min: 0 })
  buyPrice?: number;

  @prop({ required: true })
  autoRenew!: boolean;

  @prop({ required: true, ref: () => User, type: () => Number })
  seller!: Ref<User, number>;

  @prop({ required: true, type: () => [Bid] })
  bids?: mongoose.Types.Array<Bid>;

  @prop({ required: true, default: false })
  deleted?: boolean;

  @prop({ required: true })
  expiry!: Date;
}