import { z } from 'zod';

export const requestRideSchema = z.object({
  body: z.object({
    pickupLat: z.number().min(-90).max(90),
    pickupLng: z.number().min(-180).max(180),
    pickupAddress: z.string().min(5),
    destinationLat: z.number().min(-90).max(90),
    destinationLng: z.number().min(-180).max(180),
    destinationAddress: z.string().min(5),
    paymentMethod: z.enum(['CARD', 'CASH', 'WALLET', 'CORPORATE']).default('CASH'),
    requiresAccessibleTier: z.boolean().default(false),
  }),
});

export const acceptRideSchema = z.object({
  body: z.object({
    rideId: z.string().uuid(),
    vehicleId: z.string().uuid(),
  }),
});

export const cancelRideSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});
