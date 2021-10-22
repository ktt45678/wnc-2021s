import { NextFunction, Request, Response } from 'express';
import { plainToClass, ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import { HttpException } from '../common/exceptions/http.exception';

export const validateBody = (cls: ClassConstructor<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.body = plainToClass(cls, req.body);
    const errors = await validate(req.body);
    if (errors.length) {
      return next(new HttpException({
        status: 400,
        message: Object.values(errors[0].constraints).join(' AND '),
        code: errors[0]?.contexts ? Object.values(errors[0]?.contexts)[0]?.code : -1
      }));
    }
    next();
  }
}

export const validateParams = (cls: ClassConstructor<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.params = plainToClass<any, ParamsDictionary>(cls, req.params);
    const errors = await validate(req.params);
    if (errors.length) {
      return next(new HttpException({
        status: 400,
        message: Object.values(errors[0].constraints).join(' AND '),
        code: errors[0]?.contexts ? Object.values(errors[0]?.contexts)[0]?.code : -1
      }));
    }
    next();
  }
}

export const validateQuery = (cls: ClassConstructor<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.query = plainToClass<any, ParsedQs>(cls, req.query);
    const errors = await validate(req.query);
    if (errors.length) {
      return next(new HttpException({
        status: 400,
        message: Object.values(errors[0].constraints).join(' AND '),
        code: errors[0]?.contexts ? Object.values(errors[0]?.contexts)[0]?.code : -1
      }));
    }
    next();
  }
}