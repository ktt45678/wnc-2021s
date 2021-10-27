import { prop, plugin, modelOptions, Ref } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { Product, User } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
export class Notification extends TimeStamps {
  @prop()
  _id?: number;

  @prop({ required: true, ref: () => User, type: () => Number })
  user!: Ref<User, number>;

  @prop({ required: true, ref: () => Product, type: () => Number })
  product!: Ref<Product, number>;

  @prop({ required: true })
  content!: string;

  @prop({ required: true, default: false })
  viewed: boolean;
}