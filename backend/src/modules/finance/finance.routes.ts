import { Router } from 'express';
import { processRidePayment, addFunds, getWalletBalance } from './finance.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { requireIdempotency } from '../../common/middleware/idempotency.middleware';
import { processRidePaymentSchema, addFundsSchema } from './dto/finance.schema';

const router = Router();

// Wallet Queries
router.get('/wallet/balance', requireAuth, getWalletBalance);

// Financial Transactions (Strict Idempotency Required)
router.post('/wallet/topup', requireAuth, requireIdempotency, validate(addFundsSchema), addFunds);
router.post('/payments/ride', requireAuth, requireIdempotency, validate(processRidePaymentSchema), processRidePayment);

export default router;
