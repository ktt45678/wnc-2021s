import { CronJob } from 'cron';
import { Server } from 'socket.io';

import * as productsService from './routes/products/products.service';
import * as usersService from './routes/users/users.service';

export default function (io: Server) {
  const auctionJob = new CronJob('* * * * *', async () => {
    await productsService.handleAuctionsEnd(io);
  });

  auctionJob.start();
}