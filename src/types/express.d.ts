import { Server } from 'socket.io';
import { AuthUser } from '../routes/auth/entities/auth-user.entity';

declare module 'express' {
  interface Request {
    user: AuthUser;
  }

  interface Response {
    io: Server;
  }
}