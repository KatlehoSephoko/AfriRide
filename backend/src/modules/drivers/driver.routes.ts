import { Router } from 'express';
import { onboard, updateStatus, updateLocation, getUploadUrl } from './driver.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware';
import { onboardDriverSchema, updateLocationSchema, updateStatusSchema } from './dto/driver.schema';
import { Role } from '@prisma/client';

const router = Router();

// Used by prospective drivers to get signed URLs for document uploads
router.get('/documents/upload-url', requireAuth, getUploadUrl);

// Driver Onboarding
router.post('/onboard', requireAuth, validate(onboardDriverSchema), onboard);

// Live Operations (Strictly for approved drivers)
router.patch('/status', requireAuth, requireRole([Role.DRIVER]), validate(updateStatusSchema), updateStatus);
router.post('/location', requireAuth, requireRole([Role.DRIVER]), validate(updateLocationSchema), updateLocation);

export default router;
