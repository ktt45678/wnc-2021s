import { Document, startSession } from 'mongoose';
import slugify from 'slugify';
import { Server } from 'socket.io';
import { BeAnObject, IObjectWithTypegooseFunction } from '@typegoose/typegoose/lib/types';
import path from 'path';
import fs from 'fs';

import { productModel, categoryModel, Product, bidModel, userModel, Bid, User, ratingModel } from '../../models';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginateProductDto } from './dto/paginate-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BidProductDto } from './dto/bid-product.dto';
import { ApproveBidDto } from './dto/approve-bid.dto';
import { DenyBidDto } from './dto/deny-bid.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { HttpException } from '../../common/exceptions/http.exception';
import { AuthUser } from '../auth/entities/auth-user.entity';
import { MulterFile } from '../../common/interfaces/multer-file.interface';
import { LookupOptions, MongooseAggregation } from '../../utils/mongo-aggregation.util';
import { maskString } from '../../utils/string-helper.util';
import { Paginated } from '../../common/entities/paginated.entity';
import { BidStatus } from '../../enums/bid-status.enum';
import { IoRoom } from '../../enums/io-room.enum';
import { IoEvent } from '../../enums/io-event.enum';
import { SIBTemplate } from '../../enums/sendinblue-template.enum';
import { RatingType } from '../../enums/rating-type.enum';
import { sendEmailSIB } from '../../modules/email.module';
import { resizeImage } from '../../modules/sharp.module';
import { STATIC_DIR, STATIC_URL, WEBSITE_URL } from '../../config';

export const create = async (authUser: AuthUser, createProductDto: CreateProductDto, files: MulterFile[]) => {
  if (!files || files.length < 3) {
    await Promise.all(files.map(file => fs.promises.unlink(file.path).catch(() => null)));
    throw new HttpException({ status: 400, message: 'Cần ít nhất 3 ảnh' });
  }
  for (let i = 0; i < files.length; i++) {
    await resizeImage(files[i].path);
  }
  const { name, description, category, startingPrice, priceStep, buyPrice, autoRenew, expiry } = createProductDto;
  let newProduct: Document<Product>;
  const session = await startSession();
  try {
    await session.withTransaction(async () => {
      const product = new productModel({ name, description, category, startingPrice, priceStep, buyPrice, autoRenew, expiry });
      product.slug = slugify(name, { lower: true });
      product.images = files.map(file => file.filename);
      const selectedCategory = await categoryModel.findById(category);
      if (!selectedCategory)
        throw new HttpException({ status: 404, message: 'Không tìm thấy danh mục đã chọn' });
      product.seller = authUser._id;
      newProduct = await product.save({ session });
      selectedCategory.products.push(newProduct._id);
      await selectedCategory.save({ session });
    });
  } catch (e) {
    await Promise.all(files.map(file => fs.promises.unlink(file.path).catch(() => null)));
    throw e;
  }
  return newProduct.toObject();
}

export const findAll = async (paginateProductDto: PaginateProductDto, authUser: AuthUser) => {
  const sortEnum = ['_id', 'name', 'category', 'startingPrice', 'priceStep', 'buyPrice', 'displayPrice', 'seller', 'winner',
    'bidCount', 'expiry', 'createdAt', 'updatedAt'];
  const fields = {
    _id: 1, name: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, displayPrice: 1, autoRenew: 1, seller: 1,
    winner: 1, bidCount: 1, favorites: 1, ended: 1, expiry: 1, createdAt: 1, updatedAt: 1
  };
  const { page, limit, sort, search, category, ended, saleFilter, bidded, won, favorited, except } = paginateProductDto;
  const filters: any = {};
  category != undefined && (filters.category = category);
  ended != undefined && (filters.ended = ended);
  if (!authUser.isGuest) {
    if (saleFilter != undefined) {
      filters.seller = authUser._id;
      saleFilter === 2 && (filters.winner = { $ne: null });
      saleFilter === 3 && (filters.winner = null);
    }
    bidded && (filters.bidders = authUser._id);
    won && (filters.winner = authUser._id);
    favorited && (filters.favorites = authUser._id);
  }
  except != undefined && (filters._id = { $ne: except });
  const aggregation = new MongooseAggregation({ page, limit, filters, fields, sortQuery: sort, search, sortEnum, fullTextSearch: true });
  const lookups: LookupOptions[] = [{
    from: 'categories', localField: 'category', foreignField: '_id', as: 'category', isArray: false,
    project: { _id: 1, name: 1, subName: 1 }
  }, {
    from: 'users', localField: 'seller', foreignField: '_id', as: 'seller', isArray: false,
    project: { _id: 1, fullName: 1, point: 1 }
  }, {
    from: 'users', localField: 'winner', foreignField: '_id', as: 'winner', isArray: false,
    project: { _id: 1, fullName: 1, point: 1 }
  }];
  const [data] = await productModel.aggregate(aggregation.buildLookup(lookups)).exec();
  if (data) {
    for (let i = 0; i < data.results.length; i++) {
      data.results[i].images = transformImages(data.results[i].images);
      data.results[i].favorited = authUser.isGuest ? false : data.results[i].favorites.includes(authUser._id);
      data.results[i].favorites = undefined;
      if (authUser.isGuest || data.results[i].seller._id !== authUser._id)
        data.results[i].winner && (data.results[i].winner.fullName = maskString(data.results[i].winner.fullName));
    }
  }
  return data || new Paginated();
}

export const findOne = async (id: number, authUser: AuthUser) => {
  const product = await productModel.findById(id, {
    _id: 1, name: 1, description: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, displayPrice: 1, autoRenew: 1,
    bids: 1, seller: 1, winner: 1, bidCount: 1, blacklist: 1, whitelist: 1, requestedUsers: 1, favorites: 1, ended: 1, expiry: 1,
    createdAt: 1, updatedAt: 1
  }).populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    },
    { path: 'sellerRating', select: { _id: 1, type: 1, comment: 1, createdAt: 1 } },
    { path: 'winnerRating', select: { _id: 1, type: 1, comment: 1, createdAt: 1 } }
  ]).lean().exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  for (let i = 0; i < product.bids.length; i++) {
    if (!product.ended)
      (<Bid>product.bids[i]).price = undefined;
    else
      (<User>(<Bid>product.bids[i]).bidder).fullName = maskString((<User>(<Bid>product.bids[i]).bidder).fullName);
  }
  if (authUser.isGuest || (<User>product.seller)._id !== authUser._id) {
    if (!authUser.isGuest) {
      (<any>product).blacklisted = (<User[]>product.blacklist).findIndex(u => u._id === authUser._id) > -1;
      (<any>product).whitelisted = (<User[]>product.whitelist).findIndex(u => u._id === authUser._id) > -1;
      (<any>product).requestedUser = (<User[]>product.requestedUsers).findIndex(u => u._id === authUser._id) > -1;
      (<any>product).favorited = product.favorites.includes(authUser._id);
    }
    product.blacklist = undefined;
    product.whitelist = undefined;
    product.requestedUsers = undefined;
    product.favorites = undefined;
    if (!product.ended)
      product.bids = undefined;
    product.winner && ((<User>product.winner).fullName = maskString((<User>product.winner).fullName));
  }
  product.images = transformImages(product.images);
  return product;
}

export const update = async (id: number, updateProductDto: UpdateProductDto, authUser: AuthUser, io: Server) => {
  const product = await productModel.findById(id, {
    _id: 1, name: 1, description: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, displayPrice: 1, autoRenew: 1,
    bids: 1, seller: 1, winner: 1, bidCount: 1, blacklist: 1, whitelist: 1, requestedUsers: 1, ended: 1, expiry: 1, createdAt: 1, updatedAt: 1
  }).populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    }
  ]).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  if ((<any>product.seller)._id !== authUser._id)
    throw new HttpException({ status: 403, message: 'Bạn không có quyền cập nhật sản phẩm này' });
  product.description += '<br />' + updateProductDto.description;
  await product.save();
  //const updatedProduct = product.toObject();
  //for (let i = 0; i < updatedProduct.bids.length; i++) {
  //  if (!updatedProduct.ended)
  //    (<Bid>updatedProduct.bids[i]).price = undefined;
  //  else
  //    (<User>(<Bid>updatedProduct.bids[i]).bidder).fullName = maskString((<User>(<Bid>updatedProduct.bids[i]).bidder).fullName);
  //}
  //updatedProduct.images = transformImages(updatedProduct.images);
  io.in(`${IoRoom.PRODUCT_VIEW}:${id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
  //return updatedProduct;
}

export const remove = async (id: number, io: Server) => {
  const session = await startSession();
  await session.withTransaction(async () => {
    const product = await productModel.findByIdAndDelete(id, { session }).lean();
    if (!product)
      throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
    await Promise.all([
      categoryModel.updateOne({ _id: <any>product.category }, { $pull: { products: product._id } }, { session }),
      bidModel.deleteMany({ _id: { $in: product.bids } }, { session }),
      ratingModel.deleteMany({ product: product._id }, { session })
    ]);
    await Promise.all(product.images.map(image => fs.promises.unlink(path.join(__dirname, '..', '..', '..', 'public', image)).catch(() => null)));
    io.in(`${IoRoom.USER}:${product.seller}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
      content: `Sản phẩm ${product.name} đã bị gỡ bởi quản trị viên`,
      createdAt: new Date()
    });
    io.in(`${IoRoom.PRODUCT_VIEW}:${id}`).emit(IoEvent.PRODUCT_VIEW_REMOVE);
  });
}

export const createBid = async (id: number, bidProductDto: BidProductDto, authUser: AuthUser, io: Server) => {
  const product = await productModel.findById(id, {
    _id: 1, name: 1, description: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, currentPrice: 1, displayPrice: 1,
    autoRenew: 1, bids: 1, seller: 1, winner: 1, bidCount: 1, bidders: 1, blacklist: 1, whitelist: 1, requestedUsers: 1, ended: 1, expiry: 1, createdAt: 1, updatedAt: 1
  }).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  if (product.ended)
    throw new HttpException({ status: 422, message: 'Phiên đấu giá cho sản phẩm này đã kết thúc' });
  const user = await userModel.findById(authUser._id).lean().exec();
  if (user._id === product.seller)
    throw new HttpException({ status: 422, message: 'Bạn không thể tham gia đấu giá sản phẩm của chính mình' });
  if (user.ratingCount && user.point < 80)
    throw new HttpException({ status: 422, message: 'Bạn không thể tham gia đấu giá do điểm thấp (dưới 80)' });
  if (!user.ratingCount && !product.whitelist.includes(user._id))
    throw new HttpException({ status: 422, message: 'Bạn không thể tham gia đấu giá do chưa có điểm, hãy yêu cầu người bán cho phép tham gia' });
  if (product.blacklist.includes(user._id))
    throw new HttpException({ status: 422, message: 'Bạn không thể tham gia đấu giá do đã bị người bán từ chối' });
  if (product.startingPrice > bidProductDto.price)
    throw new HttpException({ status: 422, message: 'Mức giá phải cao hơn (hoặc bằng) giá khởi điểm' });
  if (!product.buyPrice || bidProductDto.price < product.buyPrice)
    if (product.winner && product.displayPrice + product.priceStep > bidProductDto.price)
      throw new HttpException({ status: 422, message: 'Mức giá phải cao hơn (hoặc bằng) giá hiện tại + bước giá' });
  if (product.winner && product.currentPrice > bidProductDto.price) {
    product.displayPrice = bidProductDto.price;
    await product.save();
    await emitRefreshProduct(product, io);
    throw new HttpException({ status: 422, message: 'Đấu giá thất bạn do đã có người ra giá cao hơn bạn' });
  }
  if (!product.buyPrice || bidProductDto.price < product.buyPrice) {
    if (product.winner && product.currentPrice + product.priceStep > bidProductDto.price) {
      product.displayPrice = product.currentPrice;
      await product.save();
      await emitRefreshProduct(product, io);
      throw new HttpException({ status: 422, message: 'Đấu giá thất bạn do mức giá của bạn chưa đủ để vượt qua người hiện tại' });
    }
  }
  const previousWinnerId = <number>product.winner;
  const buyPriceBidded = product.buyPrice && bidProductDto.price >= product.buyPrice;
  const session = await startSession();
  await session.withTransaction(async () => {
    const bid = new bidModel({
      bidder: user._id,
      product: product._id,
      price: buyPriceBidded ? product.buyPrice : bidProductDto.price,
      status: BidStatus.ACCEPTED
    });
    await bid.save({ session });
    product.bids.push(bid._id);
    product.bidCount += 1;
    if (buyPriceBidded) {
      product.displayPrice = product.buyPrice;
      product.currentPrice = product.buyPrice;
      product.ended = true;
    } else {
      product.displayPrice = product.winner ?
        product.currentPrice + product.priceStep :
        product.displayPrice;
      product.currentPrice = bidProductDto.price;
    }
    product.winner = user._id;
    product.bidders.addToSet(user._id);
    if (product.autoRenew && (product.expiry.getTime() - Date.now() < 300000))
      product.expiry = new Date(product.expiry.getTime() + 600000);
    await product.save({ session });
  });
  await product.populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, email: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, email: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    }
  ]);
  product.currentPrice = undefined;
  product.bidders = undefined;
  for (let i = 0; i < product.bids.length; i++) {
    if (!product.ended)
      (<Bid>product.bids[i]).price = undefined;
    else
      (<User>(<Bid>product.bids[i]).bidder).fullName = maskString((<User>(<Bid>product.bids[i]).bidder).fullName);
  }
  product.images = transformImages(product.images);
  const receivers = [`${IoRoom.USER}:${(<User>product.seller)._id}`];
  const priceString = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(product.displayPrice);
  if (previousWinnerId !== (<User>product.winner)._id) {
    receivers.push(`${IoRoom.USER}:${previousWinnerId}`);
    const previousWinner = await userModel.findById(previousWinnerId).lean().exec();
    if (previousWinner) {
      await sendEmailSIB(previousWinner.email, previousWinner.fullName, SIBTemplate.NEW_BID, {
        recipient_name: previousWinner.fullName,
        product_name: product.name,
        current_price: priceString,
        bidder_name: 'một người khác',
        button_url: `${WEBSITE_URL}/home/products/${product._id}`
      });
    }
  }
  await Promise.all([
    sendEmailSIB((<User>product.seller).email, (<User>product.seller).fullName, SIBTemplate.NEW_BID, {
      recipient_name: (<User>product.seller).fullName,
      product_name: product.name,
      current_price: priceString,
      bidder_name: (<User>product.winner).fullName,
      button_url: `${WEBSITE_URL}/home/products/${product._id}`
    }),
    sendEmailSIB((<User>product.winner).email, (<User>product.winner).fullName, SIBTemplate.NEW_BID, {
      recipient_name: (<User>product.winner).fullName,
      product_name: product.name,
      current_price: priceString,
      bidder_name: 'bạn',
      button_url: `${WEBSITE_URL}/home/products/${product._id}`
    })
  ]);
  if (buyPriceBidded) {
    await Promise.all([
      sendEmailSIB((<User>product.seller).email, (<User>product.seller).fullName, SIBTemplate.AUCTION_END, {
        recipient_name: (<User>product.seller).fullName,
        product_name: product.name,
        bidder_name: (<User>product.winner).fullName,
        button_url: `${WEBSITE_URL}/home/products/${product._id}`
      }),
      sendEmailSIB((<User>product.winner).email, (<User>product.winner).fullName, SIBTemplate.AUCTION_END, {
        recipient_name: (<User>product.winner).fullName,
        product_name: product.name,
        bidder_name: 'bạn',
        button_url: `${WEBSITE_URL}/home/products/${product._id}`
      })
    ]);
  }
  (<User>product.seller).email = undefined;
  (<User>product.winner).email = undefined;
  //for (let i = 0; i < product.bids.length; i++)
  //  if ((<User>(<Bid>product.bids[i]).bidder)._id !== user._id && !receivers.includes(user._id))
  //    receivers.push(`${IoRoom.USER}:${(<User>(<Bid>product.bids[i]).bidder)._id}`);
  io.in(receivers).emit(IoEvent.NOTIFICATION_PRODUCTS, {
    content: `Đã có người ra giá ${priceString} cho sản phẩm ${product.name}`,
    product: id,
    createdAt: new Date()
  });
  io.in(`${IoRoom.PRODUCT_VIEW}:${id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
  if (buyPriceBidded) {
    io.in(`${IoRoom.USER}:${(<User>product.seller)._id}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
      content: `Kết thúc phiên đấu giá cho sản phẩm ${product.name}`,
      product: product._id,
      createdAt: new Date()
    });
    io.in(`${IoRoom.USER}:${(<User>product.winner)._id}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
      content: `Bạn đã chiến thắng trong phiên đấu giá sản phẩm ${product.name}`,
      product: product._id,
      createdAt: new Date()
    });
  }
  return product.toObject();
}

export const bidHint = async (id: number) => {
  const product = await productModel.findById(id).lean().exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  return { price: product.displayPrice + product.priceStep };
}

export const requestBid = async (id: number, authUser: AuthUser, io: Server) => {
  const product = await productModel.findById(id, {
    _id: 1, name: 1, description: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, currentPrice: 1, displayPrice: 1,
    autoRenew: 1, bids: 1, seller: 1, winner: 1, bidCount: 1, blacklist: 1, whitelist: 1, requestedUsers: 1, ended: 1, expiry: 1, createdAt: 1, updatedAt: 1
  }).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  if (product.ended)
    throw new HttpException({ status: 422, message: 'Phiên đấu giá cho sản phẩm này đã kết thúc' });
  const user = await userModel.findById(authUser._id).lean().exec();
  if (user._id === product.seller)
    throw new HttpException({ status: 422, message: 'Bạn không thể tham gia đấu giá sản phẩm của chính mình' });
  if (user.ratingCount && user.point < 80)
    throw new HttpException({ status: 422, message: 'Bạn không thể dùng chức năng này do đã có điểm đánh giá' });
  if (product.blacklist.includes(user._id))
    throw new HttpException({ status: 422, message: 'Bạn không thể tham gia đấu giá do đã bị người bán từ chối' });
  if (product.whitelist.includes(user._id))
    throw new HttpException({ status: 422, message: 'Bạn đã có thể tham gia đấu giá, không cần phải yêu cầu thêm' });
  if (product.requestedUsers.includes(user._id))
    throw new HttpException({ status: 422, message: 'Bạn đã yêu cầu tham gia đấu giá trước đây' });
  product.requestedUsers.push(user._id);
  await product.save();
  await product.populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    }
  ]);
  for (let i = 0; i < product.bids.length; i++) {
    if (!product.ended)
      (<Bid>product.bids[i]).price = undefined;
    else
      (<User>(<Bid>product.bids[i]).bidder).fullName = maskString((<User>(<Bid>product.bids[i]).bidder).fullName);
  }
  product.images = transformImages(product.images);
  io.in(`${IoRoom.PRODUCT_VIEW}:${id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
  io.in(`${IoRoom.USER}:${(<User>product.seller)._id}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
    content: `${user.fullName} đang yêu cầu để ra giá sản phẩm ${product.name}`,
    product: id,
    createdAt: new Date()
  });
}

export const approveBid = async (id: number, approveBidDto: ApproveBidDto, authUser: AuthUser, io: Server) => {
  const product = await productModel.findById(id, {
    _id: 1, name: 1, description: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, currentPrice: 1, displayPrice: 1,
    autoRenew: 1, bids: 1, seller: 1, winner: 1, bidCount: 1, blacklist: 1, whitelist: 1, requestedUsers: 1, ended: 1, expiry: 1, createdAt: 1, updatedAt: 1
  }).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  if (product.ended)
    throw new HttpException({ status: 422, message: 'Phiên đấu giá cho sản phẩm này đã kết thúc' });
  if (product.seller !== authUser._id)
    throw new HttpException({ status: 403, message: 'Bạn không có quyền cập nhật sản phẩm này' });
  const user = await userModel.findById(approveBidDto.user).lean().exec();
  product.requestedUsers.pull(approveBidDto.user);
  if (user && approveBidDto.accept)
    product.whitelist.push(user._id);
  await product.save();
  await product.populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    }
  ]);
  for (let i = 0; i < product.bids.length; i++) {
    if (!product.ended)
      (<Bid>product.bids[i]).price = undefined;
    else
      (<User>(<Bid>product.bids[i]).bidder).fullName = maskString((<User>(<Bid>product.bids[i]).bidder).fullName);
  }
  product.images = transformImages(product.images);
  io.in(`${IoRoom.PRODUCT_VIEW}:${id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
  io.in(`${IoRoom.USER}:${approveBidDto.user}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
    content: `Bạn đã ${approveBidDto.accept ? 'được cho phép' : 'bị từ chối'} tham gia ra giá cho sản phẩm ${product.name}`,
    product: id,
    createdAt: new Date()
  });
}

export const denyBid = async (id: number, denyBidDto: DenyBidDto, authUser: AuthUser, io: Server) => {
  const product = await productModel.findById(id, {
    _id: 1, name: 1, description: 1, category: 1, images: 1, startingPrice: 1, priceStep: 1, buyPrice: 1, currentPrice: 1, displayPrice: 1,
    autoRenew: 1, bids: 1, seller: 1, winner: 1, bidCount: 1, blacklist: 1, whitelist: 1, requestedUsers: 1, ended: 1, expiry: 1, createdAt: 1, updatedAt: 1
  }).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  if (product.ended)
    throw new HttpException({ status: 422, message: 'Phiên đấu giá cho sản phẩm này đã kết thúc' });
  if (product.seller !== authUser._id)
    throw new HttpException({ status: 403, message: 'Bạn không có quyền cập nhật sản phẩm này' });
  const user = await userModel.findById(denyBidDto.user).lean().exec();
  if (!user)
    throw new HttpException({ status: 404, message: 'Không tìm thấy người dùng' });
  if (product.blacklist.includes(user._id))
    throw new HttpException({ status: 422, message: 'Người dùng đã bị từ chối trước đây' });
  const session = await startSession();
  await session.withTransaction(async () => {
    await bidModel.updateMany({ product: id, bidder: denyBidDto.user }, { status: BidStatus.DENIED }, { session });
    product.blacklist.push(user._id);
    if (product.winner === user._id) {
      const productBids = await bidModel.find({ product: id, status: BidStatus.ACCEPTED }, {}, { sort: { price: -1 }, session }).lean();
      if (productBids.length) {
        const bestBid = productBids[0];
        product.winner = bestBid.bidder;
        product.currentPrice = bestBid.price;
        product.displayPrice = bestBid.price;
      } else {
        product.winner = undefined;
        product.currentPrice = product.startingPrice;
        product.displayPrice = product.startingPrice;
      }
    }
    await product.save({ session });
  });
  /*
  await product.populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    }
  ]);
  for (let i = 0; i < product.bids.length; i++) {
    if (!product.ended)
      (<Bid>product.bids[i]).price = undefined;
    else
      (<User>(<Bid>product.bids[i]).bidder).fullName = maskString((<User>(<Bid>product.bids[i]).bidder).fullName);
  }
  product.images = transformImages(product.images);
  */
  await sendEmailSIB(user.email, user.fullName, SIBTemplate.NO_BID, {
    recipient_name: user.fullName,
    product_name: product.name,
    button_url: `${WEBSITE_URL}/home/products/${product._id}`
  });
  io.in(`${IoRoom.PRODUCT_VIEW}:${id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
  io.in(`${IoRoom.USER}:${denyBidDto.user}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
    content: `Bạn đã bị người bán từ chối lượt ra giá cho sản phẩm ${product.name}`,
    product: id,
    createdAt: new Date()
  });
}

export const handleAuctionsEnd = async (io: Server) => {
  const products = await productModel.find({ ended: false, expiry: { $lte: new Date() } }).populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, email: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, email: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    }
  ]).exec();
  for (let i = 0; i < products.length; i++) {
    console.log(`Product ${products[i]._id} has been expired`);
    products[i].ended = true;
    if (products[i].winner) {
      const winnerIndex = (<Bid[]>products[i].bids).findIndex(b => (<User>b.bidder)._id === (<User>products[i].winner)._id);
      if (winnerIndex > -1)
        (<Bid>products[i].bids[winnerIndex]).price = products[i].displayPrice;
      await Promise.all([
        bidModel.findOneAndUpdate({ bidder: (<User>products[i].winner)._id }, { price: products[i].displayPrice }, { sort: { price: -1 } }).exec(),
        sendEmailSIB((<User>products[i].seller).email, (<User>products[i].seller).fullName, SIBTemplate.AUCTION_END, {
          recipient_name: (<User>products[i].seller).fullName,
          product_name: products[i].name,
          bidder_name: (<User>products[i].winner).fullName,
          button_url: `${WEBSITE_URL}/home/products/${products[i]._id}`
        }),
        sendEmailSIB((<User>products[i].winner).email, (<User>products[i].winner).fullName, SIBTemplate.AUCTION_END, {
          recipient_name: (<User>products[i].winner).fullName,
          product_name: products[i].name,
          bidder_name: 'bạn',
          button_url: `${WEBSITE_URL}/home/products/${products[i]._id}`
        })
      ]);
    } else {
      await sendEmailSIB((<User>products[i].seller).email, (<User>products[i].seller).fullName, SIBTemplate.NO_BID, {
        recipient_name: (<User>products[i].seller).fullName,
        product_name: products[i].name,
        button_url: `${WEBSITE_URL}/home/products/${products[i]._id}`
      });
    }
    await products[i].save();
    for (let j = 0; j < products[i].bids.length; j++) {
      if (!products[i].ended)
        (<Bid>products[i].bids[j]).price = undefined;
      else
        (<User>(<Bid>products[i].bids[j]).bidder).fullName = maskString((<User>(<Bid>products[i].bids[j]).bidder).fullName);
    }
    (<User>products[i].seller).email = undefined;
    (<User>products[i].winner).email = undefined;
    products[i].images = transformImages(products[i].images);
    io.in(`${IoRoom.PRODUCT_VIEW}:${products[i]._id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
    io.in(`${IoRoom.USER}:${(<User>products[i].seller)._id}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
      content: `Kết thúc phiên đấu giá cho sản phẩm ${products[i].name}`,
      product: products[i]._id,
      createdAt: new Date()
    });
    io.in(`${IoRoom.USER}:${(<User>products[i].winner)._id}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
      content: `Bạn đã chiến thắng trong phiên đấu giá sản phẩm ${products[i].name}`,
      product: products[i]._id,
      createdAt: new Date()
    });
  }
}

export const createProductRating = async (id: number, createRatingDto: CreateRatingDto, authUser: AuthUser, io: Server) => {
  const product = await productModel.findById(id).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  if (!product.ended)
    throw new HttpException({ status: 400, message: 'Sản phẩm chưa kết thúc, không thể đánh giá' });
  if (!product.winner)
    throw new HttpException({ status: 400, message: 'Không thể đánhg giá sản phẩm không có người mua' });
  if (product.winner !== authUser._id && product.seller !== authUser._id)
    throw new HttpException({ status: 400, message: 'Bạn không thể tham gia đánh giá trên sản phẩm này' });
  const checkRating = await ratingModel.findOne({ $and: [{ product: id }, { user: authUser._id }] }).lean().exec();
  if (checkRating)
    throw new HttpException({ status: 422, message: 'Bạn đã đánh giá người dùng này rồi' });
  const targetUser: number = product.winner === authUser._id ? <number>product.seller : <number>product.winner;
  const session = await startSession();
  await session.withTransaction(async () => {
    const rating = new ratingModel({
      product: id,
      user: authUser._id,
      type: createRatingDto.ratingType,
      comment: createRatingDto.comment
    });
    rating.target = targetUser;
    await rating.save({ session });
    if (product.winner === authUser._id)
      product.sellerRating = rating._id;
    else
      product.winnerRating = rating._id;
    await product.save({ session });
    const [positiveCount, negativeCount] = await Promise.all([
      ratingModel.countDocuments({
        $and: [
          { target: targetUser },
          { type: RatingType.POSITIVE }
        ]
      }).session(session),
      ratingModel.countDocuments({
        $and: [
          { target: targetUser },
          { type: RatingType.NEGATIVE }
        ]
      }).session(session)
    ]);
    const point = Math.round((positiveCount / (positiveCount + negativeCount)) * 100);
    await userModel.updateOne({ _id: targetUser }, { $set: { point }, $inc: { ratingCount: 1 } }, { session });
  });
  io.in(`${IoRoom.PRODUCT_VIEW}:${product._id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
  io.in(`${IoRoom.USER}:${targetUser}`).emit(IoEvent.NOTIFICATION_PRODUCTS, {
    content: `${authUser.fullName} đã gửi đánh giá cho sản phẩm ${product.name}`,
    product: product._id,
    createdAt: new Date()
  });
}

export const addToFavorite = async (id: number, authUser: AuthUser) => {
  const product = await productModel.findById(id).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  product.favorites.addToSet(authUser._id);
  await product.save();
}

export const removeFromFavorite = async (id: number, authUser: AuthUser) => {
  const product = await productModel.findById(id).exec();
  if (!product)
    throw new HttpException({ status: 404, message: 'Không tìm thấy sản phẩm' });
  product.favorites.pull(authUser._id);
  await product.save();
}

export const findProductRating = (id: number) => {
  return ratingModel.findOne({ product: id }, {
    _id: 1, seller: 1, bidder: 1, sellerRating: 1, sellerComment: 1, bidderRating: 1, bidderComment: 1
  }).populate([
    { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, point: 1 } }
  ]).lean().exec();
}

const emitRefreshProduct = async (product: Document<any, BeAnObject, any> & Product & IObjectWithTypegooseFunction & { _id: any; }, io: Server) => {
  await product.populate([
    { path: 'category', select: { _id: 1, name: 1, subName: 1 } },
    { path: 'seller', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'winner', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'blacklist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'whitelist', select: { _id: 1, fullName: 1, point: 1 } },
    { path: 'requestedUsers', select: { _id: 1, fullName: 1, point: 1 } },
    {
      path: 'bids', select: { _id: 1, bidder: 1, price: 1 },
      options: { sort: { price: -1 } },
      populate: { path: 'bidder', select: { _id: 1, fullName: 1, point: 1 } }
    }
  ]);
  for (let i = 0; i < product.bids.length; i++) {
    if (!product.ended)
      (<Bid>product.bids[i]).price = undefined;
    else
      (<User>(<Bid>product.bids[i]).bidder).fullName = maskString((<User>(<Bid>product.bids[i]).bidder).fullName);
  }
  product.currentPrice && (product.currentPrice = undefined);
  product.images = transformImages(product.images);
  io.in(`${IoRoom.PRODUCT_VIEW}:${product._id}`).emit(IoEvent.PRODUCT_VIEW_REFRESH);
}

const transformImages = (images: string[]) => {
  const urls = [];
  if (!images.length)
    return urls;
  for (let i = 0; i < images.length; i++)
    urls.push(`${STATIC_URL}${STATIC_DIR}/${images[i]}`);
  return urls;
}