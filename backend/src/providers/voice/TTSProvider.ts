import { io } from '../../websocket/socket';
import { logger } from '../../config/logger.config';

/**
 * Text-to-Speech Abstraction.
 * Commands the frontend React Native app (via Socket.io) to use on-device TTS (expo-speech).
 */
export class TTSProvider {
  static announce(userId: string, text: string, language: string = 'en') {
    logger.info(`[TTS] Requesting voice announcement for user ${userId}: "${text}"`);
    io.to(`user_${userId}`).emit('tts.announce', {
      text,
      language,
      timestamp: new Date().toISOString()
    });
  }
}
