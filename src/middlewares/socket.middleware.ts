import { NextFunction, Request, Response } from 'express';
import { Server } from 'socket.io';

export default (io: Server) => {
  return (req: Request, res: Response, next: NextFunction) => {
    res.io = io;
    next();
  }
}