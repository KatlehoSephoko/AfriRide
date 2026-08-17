import { PrismaClient } from '@prisma/client';
import { logger } from './logger.config';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error({ err: e }, 'Prisma Database Error');
});

prisma.$on('warn', (e) => {
  logger.warn({ warning: e }, 'Prisma Database Warning');
});
