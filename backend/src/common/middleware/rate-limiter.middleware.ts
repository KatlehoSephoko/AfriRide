import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../../config/redis.config';
import { env } from '../../config/env.config';
import { errorResponse } from '../utils/api-response';

const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // @ts-expect-error - rate-limit-redis type mismatch with ioredis, but runtime is fully compatible
      sendCommand: (...args: string[]) => redis.call(...args),
      prefix: `rl_${env.NODE_ENV}:`,
    }),
    handler: (req, res) => {
      res.status(429).json(errorResponse(message));
    },
  });
};

// Global API Limit: 300 requests per 5 minutes per IP
export const globalRateLimiter = createRateLimiter(
  5 * 60 * 1000, 
  300, 
  'Too many requests from this IP, please try again after 5 minutes'
);

// Strict Authentication Limit: 10 requests per 15 minutes per IP (Prevents brute force)
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, 
  10, 
  'Too many login/registration attempts, please try again after 15 minutes'
);

// Strict OTP/Verification Limit: 5 requests per 5 minutes per IP
export const verificationRateLimiter = createRateLimiter(
  5 * 60 * 1000,
  5,
  'Too many verification attempts, please wait 5 minutes'
);
