import { prop, plugin, modelOptions, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';
import { Exclude, Expose } from 'class-transformer';

import { Role } from '../enums/role.enum';
import { UserGroup } from '../enums/user-group.enum';
import { User } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
export class Bid extends TimeStamps {
  @prop()
  _id?: number;

  @prop({ required: true, ref: () => User, type: () => String })
  bidder!: Ref<User, number>;

  @prop({ required: true, min: 0 })
  price!: number;

  @prop({ required: true, default: true })
  accepted!: boolean;
}