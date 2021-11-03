import { Router, Request, Response, NextFunction } from 'express';
import { validateBody, validateQuery } from '../../middlewares/validator.middleware';
//import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import * as categoryService from './users.service';
import authGuardMiddleware from '../../middlewares/auth-guard.middleware';
import { PaginateUserDto } from './dto/paginate-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const router: Router = Router();

router.get('/', validateQuery(PaginateUserDto), async (req: Request<any, any, any, ParsedQs & PaginateUserDto>, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.findAll(req.query);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', authGuardMiddleware({ allowGuest: true }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.findOne(+req.params.id || 0, req.user);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', authGuardMiddleware(), validateBody(UpdateUserDto), async (req: Request<any, any, UpdateUserDto>, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.update(+req.params.id || 0, req.body, req.user);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

export default router;