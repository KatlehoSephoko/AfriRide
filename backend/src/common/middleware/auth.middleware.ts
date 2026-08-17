import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.config';
import { AppError } from '../errors/AppError';
import { prisma } from '../../config/database.config';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing or invalid token', 401);
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    
    // Verify user still exists and is active (optional for every request, but safer)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { status: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Unauthorized: User account is not active', 403);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Unauthorized: Token expired', 401));
    } else {
      next(new AppError('Unauthorized: Invalid token', 401));
    }
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }
    next();
  };
};
