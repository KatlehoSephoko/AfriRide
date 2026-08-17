import { Request, Response, NextFunction } from 'express';
import { CommunicationService } from './communication.service';
import { successResponse } from '../../common/utils/api-response';

export const sendChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rideId, receiverId, content } = req.body;
    const message = await CommunicationService.sendChatMessage(req.user!.userId, rideId, receiverId, content);
    res.status(201).json(successResponse(message, 'Message sent'));
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await CommunicationService.getRideMessages(req.user!.userId, req.params.rideId);
    res.status(200).json(successResponse(messages));
  } catch (error) {
    next(error);
  }
};

export const askAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CommunicationService.processAIRequest(req.user!.userId, req.body);
    res.status(200).json(successResponse(result, 'AI interpretation complete'));
  } catch (error) {
    next(error);
  }
};
