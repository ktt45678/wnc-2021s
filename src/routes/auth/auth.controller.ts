import { Router, Request, Response, NextFunction } from 'express';
//import { ParamsDictionary } from 'express-serve-static-core';
//import { ParsedQs } from 'qs';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendConfirmationEmailDto } from './dto/send-confirmation-email.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { validateBody } from '../../middlewares/validator.middleware';
import authGuard from '../../middlewares/auth-guard.middleware';
import * as authService from './auth.service';

const router: Router = Router();

router.post('/login', validateBody(LoginDto), async (req: Request<any, any, LoginDto>, res: Response, next: NextFunction) => {
  try {
    const result = await authService.authenticate(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/register', validateBody(RegisterDto), async (req: Request<any, any, RegisterDto>, res: Response, next: NextFunction) => {
  try {
    const result = await authService.createAccount(req.body);
    res.status(201).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/send-confirmation-email', authGuard(), validateBody(SendConfirmationEmailDto), async (req: Request<any, any, SendConfirmationEmailDto>, res: Response, next: NextFunction) => {
  try {
    await authService.sendConfirmationEmail(req.user);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

router.post('/confirm-email', validateBody(ConfirmEmailDto), async (req: Request<any, any, ConfirmEmailDto>, res: Response, next: NextFunction) => {
  try {
    const result = await authService.confirmEmail(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/send-recovery-email', validateBody(RecoverPasswordDto), async (req: Request<any, any, RecoverPasswordDto>, res: Response, next: NextFunction) => {
  try {
    await authService.recoverPassword(req.body);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

router.post('/reset-password', validateBody(ResetPasswordDto), async (req: Request<any, any, ResetPasswordDto>, res: Response, next: NextFunction) => {
  try {
    await authService.resetPassword(req.body);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

router.post('/refresh-token', validateBody(RefreshTokenDto), async (req: Request<any, any, RefreshTokenDto>, res: Response, next: NextFunction) => {
  try {
    const result = await authService.refreshToken(req.body);
    res.status(200).send(result);
  } catch (e) {
    next(e);
  }
});

router.post('/revoke-token', validateBody(RefreshTokenDto), async (req: Request<any, any, RefreshTokenDto>, res: Response, next: NextFunction) => {
  try {
    await authService.revokeToken(req.body);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;