import { z } from 'zod';
import { DocumentType } from '@prisma/client';

export const onboardDriverSchema = z.object({
  body: z.object({
    licenseNumber: z.string().min(5),
    vehicle: z.object({
      make: z.string().min(2),
      model: z.string().min(2),
      year: z.number().min(2000).max(new Date().getFullYear() + 1),
      registration: z.string().min(4),
      color: z.string().min(2),
      vehicleType: z.string(),
      seatingCapacity: z.number().min(1).max(15),
      bootCapacityLitres: z.number().min(0),
      isWAV: z.boolean().default(false),
      wheelchairCapacity: z.number().default(0),
      accessibilityEquipment: z.array(z.string()).default([]),
    }),
    documents: z.array(
      z.object({
        type: z.nativeEnum(DocumentType),
        fileUrl: z.string().url(),
        expiryDate: z.string().datetime().optional(),
      })
    ).min(3, 'At least ID, License, and Vehicle Registration are required'),
  }),
});

export const updateLocationSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    heading: z.number().min(0).max(360).optional(),
    speed: z.number().min(0).optional(),
    accuracy: z.number().min(0).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ONLINE', 'OFFLINE']),
  }),
});
