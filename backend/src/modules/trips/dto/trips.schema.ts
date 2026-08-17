import { z } from 'zod';

export const requestForFriendSchema = z.object({
  body: z.object({
    passengerPhone: z.string().min(9).max(15),
    pickupLat: z.number().min(-90).max(90),
    pickupLng: z.number().min(-180).max(180),
    pickupAddress: z.string().min(5),
    destinationLat: z.number().min(-90).max(90),
    destinationLng: z.number().min(-180).max(180),
    destinationAddress: z.string().min(5),
    requiresAccessibleTier: z.boolean().default(false),
  }),
});

export const verifyPassengerSchema = z.object({
  body: z.object({
    rideId: z.string().uuid(),
    token: z.string().min(6), // The OTP sent to passenger
  }),
});
