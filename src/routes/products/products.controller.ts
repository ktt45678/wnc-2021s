import { Router, Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ParsedQs } from 'qs';

import { validateBody, validateQuery } from '../../middlewares/validator.middleware';
import authGuardMiddleware from '../../middlewares/auth-guard.middleware';
import { upload } from '../../middlewares/multer.middleware';
import classSerializer from '../../middlewares/class-serializer.middleware';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginateProductDto } from './dto/paginate-product.dto';
import * as productService from './products.service';
import { HttpException } from '../../common/exceptions/http.exception';

const router: Router = Router();

router.post('/', authGuardMiddleware(), async (req: Request<any, any, CreateProductDto>, res: Response, next: NextFunction) => {
  try {
    upload.array('images', 20)(req, res, async (err: any) => {
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

export default router;