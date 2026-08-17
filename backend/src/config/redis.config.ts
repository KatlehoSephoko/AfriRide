import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from './logger.config';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on('connect', () => {
  logger.info('🟢 Connected to Redis successfully');
});

redis.on('error', (err) => {
  logger.error({ err }, '🔴 Redis connection error');
});
