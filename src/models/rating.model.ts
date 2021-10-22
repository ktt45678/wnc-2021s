import { prop, plugin, Ref, modelOptions } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { RatingType } from '../enums/rating-type.enum';
import { User } from './user.model';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
export class Rating extends TimeStamps {
  @prop()
  _id!: number;

  @prop({ required: true, ref: () => User, type: () => Number })
  reviewer!: Ref<User, number>;

  @prop({ required: true, ref: () => User, type: () => Number })
  user!: Ref<User, number>;

  @prop({ enum: [RatingType.NEGATIVE, RatingType.POSITIVE] })
  type!: string;

  @prop({ required: true })
  comment!: string;
}