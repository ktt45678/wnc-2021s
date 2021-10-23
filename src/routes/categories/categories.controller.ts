import { Router, Request, Response, NextFunction } from 'express';
import { validateBody, validateQuery } from '../../middlewares/validator.middleware';
//import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import * as categoryService from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PaginateCategoryDto } from './dto/paginate-category.dto';

const router: Router = Router();

router.post('/', validateBody(CreateCategoryDto), async (req: Request<any, any, CreateCategoryDto>, res: Response, next: NextFunction) => {
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
    const result = await categoryService.findOne(+req.params.id);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validateBody(CreateCategoryDto), async (req: Request<any, any, CreateCategoryDto>, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.update(+req.params.id, req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.remove(+req.params.id);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

export default router;