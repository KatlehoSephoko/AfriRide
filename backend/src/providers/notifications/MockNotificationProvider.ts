import { NotificationProvider, NotificationPayload } from './NotificationProvider';
import { logger } from '../../config/logger.config';

export class MockNotificationProvider implements NotificationProvider {
  async send(payload: NotificationPayload): Promise<void> {
    // In production, this routes to Firebase Cloud Messaging, Twilio, or Infobip
    logger.info({ notification: payload }, `[MockNotification] Sent to User ${payload.userId} via ${payload.channels.join(',')}`);
  }
}

export const notificationProvider: NotificationProvider = new MockNotificationProvider();
