import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-ioredis';
import Redis from 'ioredis';

import { REDIS_URL } from '../config';

export const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 100,
  ttl: 100 // seconds
});

export const redisCache = cacheManager.caching({
  store: redisStore,
  redisInstance: new Redis(REDIS_URL),
  ttl: 100
});

const redisClient = (<any>redisCache.store).getClient();

redisClient.on('error', (err: any) => {
  console.error('Redis error: ' + err);
});