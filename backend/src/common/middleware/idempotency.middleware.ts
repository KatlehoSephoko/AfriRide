import { Request, Response, NextFunction } from 'express';
import { redis } from '../../config/redis.config';
import { AppError } from '../errors/AppError';
import { logger } from '../../config/logger.config';

/**
 * Ensures financial operations are not duplicated during network retries.
 * Requires an 'Idempotency-Key' header.
 */
export const requireIdempotency = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['idempotency-key'] as string;

  if (!key) {
    return next(new AppError('Idempotency-Key header is required for this operation', 400));
  }

  const userId = req.user?.userId;
  if (!userId) {
    return next(new AppError('Unauthorized', 401));
  }

  const redisKey = `idempotency:${userId}:${key}`;
  
  try {
    // Attempt to lock the key. EX 86400 expires the lock after 24 hours.
    // NX ensures it only sets if it doesn't already exist.
    const acquired = await redis.set(redisKey, 'PROCESSING', 'EX', 86400, 'NX');
    
    if (!acquired) {
      logger.warn(`[Idempotency] Duplicate request blocked for key: ${key}`);
      return next(new AppError('Duplicate request detected. This operation has already been processed or is currently processing.', 409));
    }

    next();
  } catch (error) {
    next(new AppError('Internal server error during idempotency check', 500));
  }
};
