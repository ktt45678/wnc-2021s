import { Router, Request, Response, NextFunction } from 'express';
import { validateBody, validateQuery } from '../../middlewares/validator.middleware';
//import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import * as categoryService from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PaginateCategoryDto } from './dto/paginate-category.dto';
import authGuardMiddleware from '../../middlewares/auth-guard.middleware';
import { Role } from '../../enums/role.enum';

const router: Router = Router();

router.post('/', authGuardMiddleware({ roles: [Role.ADMIN] }), validateBody(CreateCategoryDto), async (req: Request<any, any, CreateCategoryDto>, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.create(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.get('/', validateQuery(PaginateCategoryDto), async (req: Request<any, any, any, ParsedQs & PaginateCategoryDto>, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.findAll(req.query);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.findOne(+req.params.id || 0);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', authGuardMiddleware({ roles: [Role.ADMIN] }), validateBody(CreateCategoryDto), async (req: Request<any, any, CreateCategoryDto>, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.update(+req.params.id || 0, req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authGuardMiddleware({ roles: [Role.ADMIN] }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.remove(+req.params.id || 0);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;