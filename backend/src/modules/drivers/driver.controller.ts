import { Request, Response, NextFunction } from 'express';
import { DriverService } from './driver.service';
import { successResponse } from '../../common/utils/api-response';
import { storageProvider } from '../../providers/storage/MockStorageProvider';

export const onboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await DriverService.onboardDriver(req.user!.userId, req.body);
    res.status(201).json(successResponse(profile, 'Driver onboarding submitted successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DriverService.updateStatus(req.user!.userId, req.body.status);
    res.status(200).json(successResponse(result, `Driver is now ${result.status}`));
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await DriverService.updateLocation(req.user!.userId, req.body);
    res.status(200).json(successResponse(null, 'Location updated'));
  } catch (error) {
    next(error);
  }
};

export const getUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName, contentType } = req.query;
    if (!fileName || !contentType) {
      return res.status(400).json({ success: false, message: 'fileName and contentType required' });
    }
    const credentials = await storageProvider.generateUploadUrl(fileName as string, contentType as string);
    res.status(200).json(successResponse(credentials, 'Upload URL generated'));
  } catch (error) {
    next(error);
  }
};
