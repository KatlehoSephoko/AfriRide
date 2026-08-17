import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../common/utils/api-response';

export const registerPassenger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress = req.ip;
    const result = await AuthService.registerPassenger(req.body, ipAddress);
    res.status(201).json(successResponse(result, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const result = await AuthService.login(req.body, ipAddress, userAgent);
    res.status(200).json(successResponse(result, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.refreshTokens(req.body.refreshToken, req.ip);
    res.status(200).json(successResponse(result, 'Tokens refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (req.user && refreshToken) {
      await AuthService.logout(req.user.userId, refreshToken);
    }
    res.status(200).json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};
