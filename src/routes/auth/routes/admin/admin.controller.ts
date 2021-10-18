import { Router, Request, Response, NextFunction } from 'express';

import { RegisterDto } from '../../dto/register.dto';
import { LoginDto } from '../../dto/login.dto';
import { validateBody } from '../../../../middlewares/validator.middleware';
import * as adminService from './admin.service';

const router: Router = Router();

router.post('/login', validateBody(LoginDto), async (req: Request<any, any, LoginDto>, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.authenticate(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/register', validateBody(RegisterDto), async (req: Request<any, any, RegisterDto>, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.createAccount(req.body);
    res.status(201).send(result);
  } catch (e) {
    next(e);
  }
});

export default router;