import { prop, plugin, modelOptions, Ref, mongoose, index } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { Bid, Category, Rating, User } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
@index({ name: 1 })
@index({ category: 1 })
@index({ startingPrice: 1 })
@index({ priceStep: 1 })
@index({ buyPrice: 1 })
@index({ autoRenew: 1 })
@index({ seller: 1 })
@index({ winner: 1 })
@index({ bidCount: 1 })
@index({ bidders: 1 })
@index({ favorites: 1 })
@index({ ended: 1 })
@index({ expiry: 1 })
@index({ name: 'text', slug: 'text' })
export class Product extends TimeStamps {
  @prop()
  _id?: number;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  slug!: string;

  @prop({ required: true })
  description!: string;

  @prop({ required: true, ref: () => Category, type: () => Number })
  category!: Ref<Category, number>;

  @prop({ type: () => [String], required: true, default: [] })
  images!: string[];

  @prop({ required: true, min: 0 })
  startingPrice!: number;

  @prop({ required: true, min: 0 })
  priceStep!: number;

  @prop({ min: 0 })
  buyPrice?: number;

  @prop({ required: true, min: 0, default: function () { return this.startingPrice } })
  currentPrice!: number;

  @prop({ required: true, min: 0, default: function () { return this.startingPrice } })
  displayPrice!: number;

  @prop({ required: true })
  autoRenew!: boolean;

  @prop({ required: true, ref: () => User, type: () => Number })
  seller!: Ref<User, number>;

  @prop({ ref: () => User, type: () => Number })
  winner?: Ref<User, number>;

  @prop({ required: true, default: 0 })
  bidCount!: number;

  @prop({ required: true, ref: () => Bid, type: () => Number })
  bids?: mongoose.Types.Array<Ref<Bid, number>>;

  @prop({ required: true, ref: () => User, type: () => Number })
  blacklist?: mongoose.Types.Array<Ref<User, number>>;

  @prop({ required: true, ref: () => User, type: () => Number })
  whitelist?: mongoose.Types.Array<Ref<User, number>>;

  @prop({ required: true, ref: () => User, type: () => Number })
  requestedUsers?: mongoose.Types.Array<Ref<User, number>>;

  @prop({ required: true, ref: () => User, type: () => Number })
  bidders?: mongoose.Types.Array<Ref<User, number>>;

  @prop({ required: true, ref: () => User, type: () => Number })
  favorites?: mongoose.Types.Array<Ref<User, number>>;

  @prop({ ref: () => Rating, type: () => Number })
  sellerRating?: Ref<Rating, number>;

  @prop({ ref: () => Rating, type: () => Number })
  winnerRating?: Ref<Rating, number>;

  @prop({ required: true, default: false })
  ended?: boolean;

  @prop({ required: true })
  expiry!: Date;
}