import { z } from 'zod';

export const processRidePaymentSchema = z.object({
  body: z.object({
    rideId: z.string().uuid(),
    paymentMethod: z.enum(['CARD', 'CASH', 'WALLET', 'CORPORATE']),
  }),
});

export const addFundsSchema = z.object({
  body: z.object({
    amount: z.number().min(10.00).max(10000.00), // Max R10,000 top-up at once
  }),
});
