import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger.config';
import { AppError } from '../errors/AppError';
import { errorResponse } from '../utils/api-response';
import { env } from '../../config/env.config';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn({ err }, `[AppError] ${err.message}`);
    return res.status(err.statusCode).json(errorResponse(err.message));
  }

  // Handle unexpected errors
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled Exception');
  
  const message = env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  return res.status(500).json(errorResponse(message, env.NODE_ENV !== 'production' ? err.stack : undefined));
};
