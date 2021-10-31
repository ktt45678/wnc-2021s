import { Router, Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ParsedQs } from 'qs';

import { validateBody, validateQuery } from '../../middlewares/validator.middleware';
import authGuardMiddleware from '../../middlewares/auth-guard.middleware';
import { upload } from '../../middlewares/multer.middleware';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginateProductDto } from './dto/paginate-product.dto';
import * as productService from './products.service';
import { HttpException } from '../../common/exceptions/http.exception';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../../enums/role.enum';
import { BidProductDto } from './dto/bid-product.dto';
import { ApproveBidDto } from './dto/approve-bid.dto';
import { DenyBidDto } from './dto/deny-bid.dto';

const router: Router = Router();

router.post('/', authGuardMiddleware({ roles: [Role.SELLER] }), async (req: Request<any, any, CreateProductDto>, res: Response, next: NextFunction) => {
  try {
    upload.array('images', 30)(req, res, async (err: any) => {
      if (err)
        return next(new HttpException({ status: 415, message: err.message }));
      req.body = plainToClass(CreateProductDto, req.body);
      const errors = await validate(req.body);
      if (errors.length) {
        return next(new HttpException({
          status: 400,
          message: Object.values(errors[0].constraints).join(' AND '),
          code: errors[0]?.contexts ? Object.values(errors[0]?.contexts)[0]?.code : -1
        }));
      }
      if (!req.files || req.files.length < 3)
        return next(new HttpException({ status: 400, message: 'Cần ít nhất 3 ảnh' }));
      const result = await productService.create(req.user, req.body, <any>req.files);
      res.status(200).send(result);
    });
  } catch (e) {
    next(e);
  }
});

router.get('/', validateQuery(PaginateProductDto), async (req: Request<any, any, any, ParsedQs & PaginateProductDto>, res: Response, next: NextFunction) => {
  try {
    const result = await productService.findAll(req.query);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.findOne(+req.params.id || 0);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', authGuardMiddleware(), validateBody(UpdateProductDto), async (req: Request<any, any, UpdateProductDto>, res: Response, next: NextFunction) => {
  try {
    const result = await productService.update(+req.params.id || 0, req.body, req.user, res.io);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authGuardMiddleware({ roles: [Role.ADMIN] }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.remove(+req.params.id || 0, res.io);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.post('/:id/bid', authGuardMiddleware({ roles: [Role.BIDDER, Role.SELLER] }), validateBody(BidProductDto), async (req: Request<any, any, BidProductDto>, res: Response, next: NextFunction) => {
  try {
    const result = await productService.createBid(+req.params.id || 0, req.body, req.user, res.io);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/bid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.bidHint(+req.params.id || 0);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/request-bid', authGuardMiddleware({ roles: [Role.BIDDER, Role.SELLER] }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.requestBid(+req.params.id || 0, req.user, res.io);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.post('/:id/approve-bid', authGuardMiddleware({ roles: [Role.BIDDER, Role.SELLER] }), validateBody(ApproveBidDto), async (req: Request<any, any, ApproveBidDto>, res: Response, next: NextFunction) => {
  try {
    await productService.approveBid(+req.params.id || 0, req.body, req.user, res.io);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

router.post('/:id/deny-bid', authGuardMiddleware({ roles: [Role.BIDDER, Role.SELLER] }), validateBody(DenyBidDto), async (req: Request<any, any, DenyBidDto>, res: Response, next: NextFunction) => {
  try {
    await productService.denyBid(+req.params.id || 0, req.body, req.user, res.io);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;