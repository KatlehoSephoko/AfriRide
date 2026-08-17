import { Request, Response } from 'express';
import { prisma } from '../../config/database.config';
import { redis } from '../../config/redis.config';
import { successResponse, errorResponse } from '../../common/utils/api-response';
import { logger } from '../../config/logger.config';

export const checkHealth = (req: Request, res: Response) => {
  return res.status(200).json(successResponse({ status: 'OK', timestamp: new Date().toISOString() }, 'AfriRide API is healthy'));
};

export const checkReadiness = async (req: Request, res: Response) => {
  try {
    // Check Database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    const redisPing = await redis.ping();
    if (redisPing !== 'PONG') throw new Error('Redis ping failed');

    return res.status(200).json(
      successResponse(
        {
          database: 'connected',
          redis: 'connected',
          timestamp: new Date().toISOString(),
        },
        'AfriRide API is ready to accept traffic'
      )
    );
  } catch (error) {
    logger.error({ err: error }, 'Readiness check failed');
    return res.status(503).json(errorResponse('Service Unavailable: Infrastructure not ready'));
  }
};
