import { Request, Response, NextFunction } from 'express';
import { SafetyService } from './safety.service';
import { successResponse } from '../../common/utils/api-response';

export const triggerPanic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alert = await SafetyService.triggerPanic(req.user!.userId, req.body);
    res.status(201).json(successResponse(alert, 'Panic alert activated and services dispatched'));
  } catch (error) {
    next(error);
  }
};

export const addTrustedContact = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await SafetyService.addTrustedContact(req.user!.userId, req.body);
    res.status(201).json(successResponse(contact, 'Trusted contact added'));
  } catch (error) {
    next(error);
  }
};
