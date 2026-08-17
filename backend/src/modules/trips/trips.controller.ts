import { Request, Response, NextFunction } from 'express';
import { TripsService } from './trips.service';
import { successResponse } from '../../common/utils/api-response';

export const requestForFriend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TripsService.requestForFriend(req.user!.userId, req.body);
    res.status(201).json(successResponse(result, 'Verification token sent to friend'));
  } catch (error) {
    next(error);
  }
};

export const verifyPassenger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TripsService.verifyPassenger(req.body.rideId, req.body.token);
    res.status(200).json(successResponse(result, 'Passenger verified successfully'));
  } catch (error) {
    next(error);
  }
};
