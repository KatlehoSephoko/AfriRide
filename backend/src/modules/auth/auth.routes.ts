import { Router } from 'express';
import { registerPassenger, login, refresh, logout } from './auth.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { registerPassengerSchema, loginSchema, refreshSchema } from './dto/auth.schema';

const router = Router();

router.post('/register/passenger', validate(registerPassengerSchema), registerPassenger);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', requireAuth, logout);

export default router;
