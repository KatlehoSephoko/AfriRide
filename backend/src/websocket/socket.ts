import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';
import { JwtPayload } from '../common/middleware/auth.middleware';

export let io: Server;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.NODE_ENV === 'production' ? ['https://afriride.com'] : '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as JwtPayload;
    logger.debug(`[Socket] User ${user.userId} connected (Role: ${user.role})`);

    // 1. Join Personal Room
    socket.join(`user_${user.userId}`);

    // 2. Join Role-Specific Room
    socket.join(`role_${user.role}`);

    // 3. Handle Ride Room Subscriptions
    socket.on('join_ride_room', (rideId: string) => {
      // In production, verify user belongs to this ride via DB before joining
      socket.join(`ride_${rideId}`);
      logger.debug(`[Socket] User ${user.userId} joined ride room: ${rideId}`);
    });

    socket.on('leave_ride_room', (rideId: string) => {
      socket.leave(`ride_${rideId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`[Socket] User ${user.userId} disconnected`);
    });
  });

  logger.info('🟢 Socket.io initialized');
};
