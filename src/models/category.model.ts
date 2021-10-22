import { prop, plugin, Ref, modelOptions, index, mongoose } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { AutoIncrementID } from '@typegoose/auto-increment';

import { Product } from '.';

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(AutoIncrementID, { startAt: 1 })
@index({ parent: 1 }, { sparse: true })
export class Category extends TimeStamps {
  @prop()
  _id!: number;

  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  subName!: string;

  @prop({ ref: () => Product, type: () => Number })
  products!: mongoose.Types.Array<Ref<Product, number>>;
}