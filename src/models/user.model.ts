import { prop, plugin, modelOptions, Ref, mongoose } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { Exclude, Expose } from 'class-transformer';

import { Role } from '../enums/role.enum';
import { UserGroup } from '../enums/user-group.enum';
import { Product, Rating } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
export class User extends TimeStamps {
  @prop()
  _id?: number;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ required: true, unique: true })
  email!: string;

  @prop({ required: true })
  fullName!: string;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop()
  birthdate?: Date;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ required: true })
  address!: string;

  @Exclude({ toPlainOnly: true })
  @prop({ required: true })
  password!: string;

  @prop({ required: true, enum: [Role.ADMIN, Role.BIDDER, Role.SELLER] })
  role!: string;

  @Exclude({ toPlainOnly: true })
  @prop({ unique: true, sparse: true })
  activationCode?: string;

  @Exclude({ toPlainOnly: true })
  @prop({ unique: true, sparse: true })
  recoveryCode?: string;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ required: true, default: false })
  activated?: boolean;

  @prop({ required: true, default: 0 })
  point?: number;

  @prop({ ref: () => Rating, type: () => Number })
  ratings?: mongoose.Types.Array<Ref<Rating, number>>;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ default: false })
  requestUpgrade?: boolean;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop()
  canSellUntil?: Date;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ME] })
  @prop({ ref: () => Product, type: () => Number })
  watchlist?: mongoose.Types.Array<Ref<Product, number>>;
}