import { Server } from 'socket.io';
import { User } from '../models/user.model';

declare module 'express' {
  interface Request {
    user: User;
  }

  interface Response {
    io: Server;
  }
}