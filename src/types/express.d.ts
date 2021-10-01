import { Server } from 'socket.io';

declare module 'express' {
  interface Response {
    io: Server;
  }
}