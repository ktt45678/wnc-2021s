import { Server, Socket } from 'socket.io';

import { IoEvent } from './enums/io-event.enum';
import { IoRoom } from './enums/io-room.enum';
import { verifyJwtAsync } from './utils/jwt.util';
import { User } from './models';
import { ACCESS_TOKEN_SECRET } from './config';

export default function (io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected: ' + socket.id);

    socket.on(IoEvent.PRODUCTS_VIEW_JOIN, async (data) => {
      await socket.join(`${IoRoom.PRODUCT_VIEW}:${data.id}`);
    });

    socket.on(IoEvent.PRODUCTS_VIEW_LEAVE, async (data) => {
      await socket.leave(`${IoRoom.PRODUCT_VIEW}:${data.id}`);
    });

    socket.on(IoEvent.AUTHENTICATE, async (data) => {
      try {
        const payload = await verifyJwtAsync<User>(data.accessToken, ACCESS_TOKEN_SECRET);
        await socket.join(`${IoRoom.USER}:${payload._id}`);
      } catch { }
    });

    socket.on(IoEvent.UNAUTHENTICATE, async (data) => {
      try {
        const payload = await verifyJwtAsync<User>(data.accessToken, ACCESS_TOKEN_SECRET);
        await socket.leave(`${IoRoom.USER}:${payload._id}`);
      } catch { }
    });
  });
}