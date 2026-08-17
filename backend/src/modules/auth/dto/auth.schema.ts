import { z } from 'zod';
import { DisabilityType } from '@prisma/client';

export const registerPassengerSchema = z.object({
  body: z.object({
    phone: z.string().min(9).max(15),
    email: z.string().email().optional(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    
    // Consent (POPIA compliant)
    termsAccepted: z.boolean().refine(val => val === true, { message: "Terms must be accepted" }),
    privacyPolicyAccepted: z.boolean().refine(val => val === true, { message: "Privacy Policy must be accepted" }),
    popiaConsent: z.boolean().refine(val => val === true, { message: "Data processing consent is required" }),
    
    // Optional Accessibility initialization
    accessibility: z.object({
      requiresAccessibleTier: z.boolean().optional(),
      disabilityType: z.nativeEnum(DisabilityType).optional(),
    }).optional()
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(9).max(15),
    password: z.string(),
    deviceInfo: z.object({
      deviceName: z.string().optional(),
      deviceToken: z.string().optional(), // Push token
    }).optional(),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});
