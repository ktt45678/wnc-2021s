import { NextFunction, Request, Response } from 'express';

import { AuthUser } from '../routes/auth/entities/auth-user.entity';
import { AuthGuardOptions } from '../common/entities/auth-guard-options.entity';
import * as authService from '../routes/auth/auth.service';

const defaultOptions: AuthGuardOptions = {
  allowGuest: false,
  requireActivate: false,
  roles: []
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
      return res.status(401).send({ message: 'Hãy đăng nhập để sử dụng chức năng này' });
    }
    const accessToken = authorization.split(' ')[1];
    if (!accessToken) {
      return res.status(401).send({ message: 'Access token is empty' });
    }
    try {
      user = await authService.verifyAccessToken(accessToken);
      user.isGuest = false;
      if (options.roles?.length)
        if (!options.roles.includes(user.role))
          return res.status(403).send({ message: 'Bạn không có quyền sử dụng tính năng này' });
      if (user.banned)
        return res.status(403).send({ message: 'Tài khoản của bạn đã bị khóa' });
      if (options.requireActivate && !user.activated)
        return res.status(403).send({ message: 'Bạn cần kích hoạt tài khoản để sử dụng chức năng này' });
      req.user = user;
      next()
    } catch {
      res.status(401).send({ message: 'Unauthorized' });
    }
  }
}