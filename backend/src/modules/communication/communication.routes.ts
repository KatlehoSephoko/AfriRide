import { Router } from 'express';
import { sendChat, getMessages, askAI } from './communication.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { sendMessageSchema, aiMessageSchema } from './dto/communication.schema';

const router = Router();

// Standard Chat
router.post('/chat', requireAuth, validate(sendMessageSchema), sendChat);
router.get('/chat/:rideId', requireAuth, getMessages);

// AI Communication Engine
router.post('/ai/message', requireAuth, validate(aiMessageSchema), askAI);

export default router;
