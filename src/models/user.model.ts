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

  @Expose({ toClassOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ required: true, unique: true })
  email!: string;

  @prop({ required: true })
  fullName!: string;

  @Expose({ toClassOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop()
  birthdate?: Date;

  @Expose({ toClassOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ required: true })
  address!: string;

  @Exclude({ toClassOnly: true })
  @prop({ required: true })
  password!: string;

  @prop({ required: true, enum: [Role.ADMIN, Role.USER] })
  role!: string;

  @Exclude({ toClassOnly: true })
  @prop()
  activationCode?: string;

  @Exclude({ toClassOnly: true })
  @prop()
  recoveryCode?: string;

  @Expose({ toClassOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ required: true, default: false })
  activated?: boolean;

  @prop({ required: true, default: DEFAULT_ACCOUNT_POINT, min: 0 })
  point?: number;

  @prop({ required: function () { return this.role === Role.USER; }, enum: [AccountType.BIDDER, AccountType.SELLER] })
  accountType?: string;

  @Expose({ toClassOnly: true, groups: [UserGroup.ADMIN, UserGroup.ME] })
  @prop({ ref: () => UserRequest })
  requests?: Ref<UserRequest>[];

  @Expose({ toClassOnly: true, groups: [UserGroup.ME] })
  @prop()
  watchlist?: number;
}