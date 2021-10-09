import { Router, Request, Response, NextFunction } from 'express';
//import { ParamsDictionary } from 'express-serve-static-core';
//import { ParsedQs } from 'qs';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { createAccount, authenticate, sendConfirmationEmail, confirmEmail } from './auth.service';
import { validateBody, validateQuery } from '../../middlewares/validator.middleware';
import authGuard from '../../middlewares/auth-guard.middleware';

const router: Router = Router();

router.post('/login', validateBody(LoginDto), async (req: Request<any, any, LoginDto>, res: Response, next: NextFunction) => {
  try {
    const result = await authenticate(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/register', validateBody(RegisterDto), async (req: Request<any, any, RegisterDto>, res: Response, next: NextFunction) => {
  try {
    const result = await createAccount(req.body);
    res.status(201).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/send-confirmation-email', authGuard(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendConfirmationEmail(req.user);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

router.post('/confirm-email', validateBody(ConfirmEmailDto), async (req: Request<any, any, ConfirmEmailDto>, res: Response, next: NextFunction) => {
  try {
    const result = await confirmEmail(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

export default router;