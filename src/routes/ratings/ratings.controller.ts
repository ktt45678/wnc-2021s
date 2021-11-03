import { Router, Request, Response, NextFunction } from 'express';
import { validateBody, validateQuery } from '../../middlewares/validator.middleware';
//import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import * as ratingsService from './ratings.service';
import authGuardMiddleware from '../../middlewares/auth-guard.middleware';
import { PaginateRatingDto } from './dto/paginate-rating.dto';

const router: Router = Router();

router.get('/', authGuardMiddleware({ allowGuest: true }), validateQuery(PaginateRatingDto), async (req: Request<any, any, any, ParsedQs & PaginateRatingDto>, res: Response, next: NextFunction) => {
  try {
    const result = await ratingsService.findAll(req.query, req.user);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

export default router;