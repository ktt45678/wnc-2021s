import { productModel, Product } from '../../models';
import { CreateProductDto } from './dto/create-product.dto';

export const create = async (createProductDto: CreateProductDto) => {
  const { } = createProductDto;
  const product = new productModel();
  const newProduct = await product.save();
  return newProduct.toObject();
}