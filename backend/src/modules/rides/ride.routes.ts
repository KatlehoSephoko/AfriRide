import { Router } from 'express';
import { requestRide, acceptRide, driverArrived, startTrip, completeTrip, cancelRide } from './ride.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware';
import { requestRideSchema, acceptRideSchema, cancelRideSchema } from './dto/ride.schema';
import { Role } from '@prisma/client';

const router = Router();

// Passenger Routes
router.post('/request', requireAuth, requireRole([Role.PASSENGER]), validate(requestRideSchema), requestRide);

// Driver Routes (State Machine Progression)
router.post('/accept', requireAuth, requireRole([Role.DRIVER]), validate(acceptRideSchema), acceptRide);
router.post('/:id/arrive', requireAuth, requireRole([Role.DRIVER]), driverArrived);
router.post('/:id/start', requireAuth, requireRole([Role.DRIVER]), startTrip);
router.post('/:id/complete', requireAuth, requireRole([Role.DRIVER]), completeTrip);

// Shared Routes (Passenger or Driver can cancel)
router.post('/:id/cancel', requireAuth, validate(cancelRideSchema), cancelRide);

export default router;
