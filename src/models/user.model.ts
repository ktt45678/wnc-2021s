import { prop, plugin, modelOptions, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { Exclude, Expose } from 'class-transformer';

import { UserRequest } from './user-request.model';
import { Role } from '../enums/role.enum';
import { AccountType } from '../enums/account-type.enum';
import { UserGroup } from '../enums/user-group.enum';
import { DEFAULT_ACCOUNT_POINT } from '../config';

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

  @prop({ required: true, default: DEFAULT_ACCOUNT_POINT, min: 0 })
  point?: number;

  @Expose({ toPlainOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ ref: () => UserRequest })
  requests?: Ref<UserRequest>[];

  @Expose({ toPlainOnly: true, groups: [UserGroup.ME] })
  @prop()
  watchlist?: number;
}