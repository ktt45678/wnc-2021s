import { NextFunction, Request, Response } from 'express';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';

import { HttpException } from '../common/exceptions/http.exception';

export default (cls: ClassConstructor<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.body = plainToClass(cls, req.body);
    const errors = await validate(req.body);
    if (errors.length) {
      return next(new HttpException({
        status: 400,
        message: Object.values(errors[0].constraints).join(' AND ')
      }));
    }
    next();
  }
}
