import { Router } from 'express';
import { requestForFriend, verifyPassenger } from './trips.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware';
import { requestForFriendSchema, verifyPassengerSchema } from './dto/trips.schema';
import { Role } from '@prisma/client';

const router = Router();

router.post('/request-for-friend', requireAuth, requireRole([Role.PASSENGER]), validate(requestForFriendSchema), requestForFriend);
router.post('/verify-passenger', requireAuth, validate(verifyPassengerSchema), verifyPassenger);

export default router;
