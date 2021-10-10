import { NextFunction, Request, Response } from 'express';

import { AuthUser } from '../routes/auth/entities/auth-user.entity';
import { AuthGuardOptions } from '../common/entities/auth-guard-options.entity';
import * as authService from '../routes/auth/auth.service';

const defaultOptions: AuthGuardOptions = {
  allowGuest: false
}

export default (options?: AuthGuardOptions) => {
  options = { ...defaultOptions, ...options };
  return async (req: Request, res: Response, next: NextFunction) => {
    let user = new AuthUser();
    const { authorization } = req.headers;
    if (!authorization) {
      if (options.allowGuest) {
        user.isGuest = true;
        req.user = user;
        return next();
      }
      return res.status(401).send({ error: 'No authorization' });
    }
    const accessToken = authorization.split(' ')[1];
    if (!accessToken) {
      return res.status(401).send({ error: 'Access token is empty' });
    }
    try {
      user = await authService.verifyAccessToken(accessToken);
      user.isGuest = false;
      req.user = user;
      next()
    } catch {
      res.status(401).send({ error: 'Unauthorized' });
    }
  }
}