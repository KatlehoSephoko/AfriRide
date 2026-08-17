import { Router } from 'express';
import { triggerPanic, addTrustedContact } from './safety.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { panicSchema, addTrustedContactSchema } from './dto/safety.schema';

const router = Router();

router.post('/panic', requireAuth, validate(panicSchema), triggerPanic);
router.post('/trusted-contacts', requireAuth, validate(addTrustedContactSchema), addTrustedContact);

export default router;
