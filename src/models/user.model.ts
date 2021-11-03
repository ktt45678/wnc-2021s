import { prop, plugin, modelOptions, Ref, mongoose, index } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { Exclude, Expose } from 'class-transformer';

import { Role } from '../enums/role.enum';
import { UserGroup } from '../enums/user-group.enum';
import { Rating } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
@index({ fullName: 1 })
@index({ birthdate: 1 })
@index({ point: 1 })
@index({ canSellUntil: 1 })
@index({ requestUpgrade: 1 })
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

  @prop({ required: true, default: 0 })
  ratingCount?: number;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ required: true, default: false })
  requestUpgrade!: boolean;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop()
  canSellUntil?: Date;

  @prop({ required: true, default: false })
  banned!: boolean;
}