import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { globalErrorHandler } from './common/middleware/error.middleware';
import { errorResponse } from './common/utils/api-response';
import rootRouter from './routes';

const app: Application = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? ['https://afriride.com', 'https://admin.afriride.com'] : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Payload parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request Logging
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === `${env.API_PREFIX}/health`,
  },
}));

// API Routes
app.use(env.API_PREFIX, rootRouter);

// 404 Handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json(errorResponse(`Route ${req.method} ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
