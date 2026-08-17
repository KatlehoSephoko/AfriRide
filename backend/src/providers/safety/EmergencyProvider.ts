import { env } from '../../config/env.config';
import { logger } from '../../config/logger.config';

export interface EmergencyProvider {
  dispatchSOS(payload: { userId: string, location: { lat: number, lng: number }, context?: any }): Promise<void>;
}

export class MockEmergencyProvider implements EmergencyProvider {
  async dispatchSOS(payload: any): Promise<void> {
    if (env.NODE_ENV === 'production') {
      // In production, this must integrate with a real South African armed response 
      // or emergency service API (e.g., Namola API, Aura API).
      throw new Error('MockEmergencyProvider cannot be used in production without a real dispatch API.');
    }
    
    logger.error(`[MOCK EMERGENCY] 🚨 SOS Dispatched to authorities! User: ${payload.userId} at ${payload.location.lat}, ${payload.location.lng}`);
  }
}

export const emergencyProvider: EmergencyProvider = new MockEmergencyProvider();
