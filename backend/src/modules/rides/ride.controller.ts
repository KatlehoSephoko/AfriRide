import { Request, Response, NextFunction } from 'express';
import { RideService } from './ride.service';
import { successResponse } from '../../common/utils/api-response';
import { RideStatus } from '@prisma/client';

export const requestRide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RideService.requestRide(req.user!.userId, req.body);
    res.status(201).json(successResponse(result, 'Ride requested successfully'));
  } catch (error) {
    next(error);
  }
};

export const acceptRide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rideId, vehicleId } = req.body;
    const result = await RideService.acceptRide(req.user!.userId, rideId, vehicleId);
    res.status(200).json(successResponse(result, 'Ride accepted'));
  } catch (error) {
    next(error);
  }
};

export const driverArrived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RideService.updateRideState(
      req.user!.userId, req.params.id, RideStatus.ARRIVED, [RideStatus.DRIVER_ASSIGNED, RideStatus.DRIVER_EN_ROUTE]
    );
    res.status(200).json(successResponse(result, 'Driver arrived'));
  } catch (error) {
    next(error);
  }
};

export const startTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RideService.updateRideState(
      req.user!.userId, req.params.id, RideStatus.IN_TRIP, [RideStatus.ARRIVED]
    );
    res.status(200).json(successResponse(result, 'Trip started'));
  } catch (error) {
    next(error);
  }
};

export const completeTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RideService.completeRide(req.user!.userId, req.params.id);
    res.status(200).json(successResponse(result, 'Trip completed'));
  } catch (error) {
    next(error);
  }
};

export const cancelRide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await RideService.cancelRide(req.user!.userId, req.user!.role, req.params.id, req.body.reason);
    res.status(200).json(successResponse(result, 'Ride cancelled'));
  } catch (error) {
    next(error);
  }
};
