import { apiClient } from './client';

export const aiApi = {
  sendMessage: async (text: string, rideId?: string) => {
    const response = await apiClient.post('/communication/ai/message', {
      text,
      context: { rideId, currentScreen: 'HOME' }
    });
    return response.data; // Returns structured AIResponse (intent, entities, replyText)
  }
};
