import { z } from 'zod';
import { PanicTrigger } from '@prisma/client';

export const panicSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    rideId: z.string().uuid().nullable().optional(),
    trigger: z.nativeEnum(PanicTrigger),
  }),
});

export const addTrustedContactSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(9).max(15),
    shareTrips: z.boolean().default(true),
    notifyOnSOS: z.boolean().default(true),
  })
});
