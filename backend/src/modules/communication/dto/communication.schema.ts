import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    rideId: z.string().uuid(),
    receiverId: z.string().uuid(),
    content: z.string().min(1).max(1000),
  }),
});

export const aiMessageSchema = z.object({
  body: z.object({
    text: z.string().min(1),
    audioTranscription: z.string().optional(),
    context: z.object({
      rideId: z.string().uuid().optional(),
      currentScreen: z.string().optional(),
    }).default({}),
  }),
});
