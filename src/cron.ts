import { CronJob } from 'cron';
import { Server } from 'socket.io';

import * as productsService from './routes/products/products.service';
import * as usersService from './routes/users/users.service';

export default function (io: Server) {
  const auctionJob = new CronJob('* * * * *', async () => {
    await productsService.handleAuctionsEnd(io);
  });

  const downgradeJob = new CronJob('0 0 * * *', async () => {
    await usersService.handleExpiredSellers(io);
  });

  auctionJob.start();
  downgradeJob.start();
}