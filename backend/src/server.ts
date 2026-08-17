import app from './app';
import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { prisma } from './config/database.config';
import { redis } from './config/redis.config';
import { Server } from 'http';

let server: Server;

const startServer = async () => {
  try {
    // 1. Validate Database Connection
    await prisma.$connect();
    logger.info('🟢 PostgreSQL connected via Prisma');

    // 2. Start Express Server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 AfriRide API running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

  } catch (error) {
    logger.error({ err: error }, '🔴 Failed to start server');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      logger.info('PostgreSQL disconnected');
      await redis.quit();
      logger.info('Redis disconnected');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force shutdown if it takes too long
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled exceptions
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception');
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Rejection');
  gracefulShutdown('unhandledRejection');
});

startServer();
