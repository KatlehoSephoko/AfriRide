import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.config';
import { env } from '../../config/env.config';
import { AppError } from '../../common/errors/AppError';
import { Role } from '@prisma/client';

export class AuthService {
  static generateTokens(userId: string, role: Role) {
    const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    
    const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  static async registerPassenger(data: any, ipAddress?: string) {
    const existingUser = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existingUser) {
      throw new AppError('Phone number is already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // Using transaction to ensure all identity & consent data writes atomically
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phone: data.phone,
          email: data.email,
          passwordHash,
          role: Role.PASSENGER,
          
          passengerProfile: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              requiresAccessibleTier: data.accessibility?.requiresAccessibleTier ?? false,
              disabilityType: data.accessibility?.disabilityType ?? 'NONE',
            }
          },
          
          userConsents: {
            create: {
              termsAccepted: data.termsAccepted,
              termsVersion: '1.0',
              privacyPolicyAccepted: data.privacyPolicyAccepted,
              privacyPolicyVersion: '1.0',
              popiaConsent: data.popiaConsent,
              ipAddress,
            }
          }
        },
        include: { passengerProfile: true }
      });

      return newUser;
    });

    const tokens = this.generateTokens(user.id, user.role);
    
    await prisma.deviceSession.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        ipAddress,
      }
    });

    // Exclude passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async login(data: any, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { phone: data.phone },
      include: { passengerProfile: true }
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Invalid credentials or inactive account', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens(user.id, user.role);

    await prisma.deviceSession.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        deviceName: data.deviceInfo?.deviceName,
        deviceToken: data.deviceInfo?.deviceToken,
        ipAddress,
        userAgent,
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  static async refreshTokens(refreshToken: string, ipAddress?: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      
      const session = await prisma.deviceSession.findUnique({
        where: { refreshToken }
      });

      if (!session || !session.isValid) {
        throw new AppError('Invalid or revoked session', 401);
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || user.status !== 'ACTIVE') {
        throw new AppError('User not found or inactive', 401);
      }

      // Token rotation
      const tokens = this.generateTokens(user.id, user.role);

      await prisma.$transaction([
        prisma.deviceSession.update({
          where: { id: session.id },
          data: { isValid: false } // Invalidate old refresh token
        }),
        prisma.deviceSession.create({
          data: {
            userId: user.id,
            refreshToken: tokens.refreshToken,
            deviceName: session.deviceName,
            deviceToken: session.deviceToken,
            ipAddress,
          }
        })
      ]);

      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  static async logout(userId: string, refreshToken: string) {
    await prisma.deviceSession.updateMany({
      where: { userId, refreshToken, isValid: true },
      data: { isValid: false }
    });
  }
}
