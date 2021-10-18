import { NextFunction, Request, Response } from 'express';
import { classToPlain } from 'class-transformer';

export default (req: Request, res: Response, next: NextFunction) => {
  const defaultSend = res.send;
  res.send = (data: any) => {
    data = classToPlain(data);
    res.send = defaultSend;
    return res.send(data);
  };
  next();
}