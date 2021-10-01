import { prop, plugin, Ref, modelOptions } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { User } from './user.model';
import { UserRequestStatus } from '../enums/user-request-status.enum'
import { USER_REQUEST_DURATION } from '../config';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
export class UserRequest extends TimeStamps {
  @prop()
  _id!: number;

  @prop({ required: true, ref: () => User })
  user!: Ref<User>;

  @prop({ required: true })
  message!: string;

  @prop({ required: true, enum: [UserRequestStatus.PENDING, UserRequestStatus.ACCEPTED, UserRequestStatus.DENIED] })
  status!: string;

  @prop({ required: function () { return this.status === UserRequestStatus.ACCEPTED; }, sparse: true, expires: USER_REQUEST_DURATION })
  expiry?: Date;
}