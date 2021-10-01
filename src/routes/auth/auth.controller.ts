import { Router, Request, Response, NextFunction } from 'express';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { createAccount, authenticate } from './auth.service';
import validator from '../../middlewares/validator.middleware';

const router: Router = Router();

router.post('/login', validator(LoginDto), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authenticate(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/register', validator(RegisterDto), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await createAccount(req.body);
    res.status(201).send(result);
  } catch (e) {
    next(e);
  }
});

export default router;