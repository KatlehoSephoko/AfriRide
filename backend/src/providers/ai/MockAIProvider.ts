import { AIProvider, AIInput, AIResponse } from './AIProvider';

/**
 * Development Mock: Simulates an LLM parsing mixed African languages and slang 
 * into structured intents. In production, this wraps Gemini or OpenAI.
 */
export class MockAIProvider implements AIProvider {
  async understand(input: AIInput): Promise<AIResponse> {
    const text = input.text.toLowerCase();
    
    // Simulate intent extraction for "Ngicela ungithathele eHatfield kodwa ngifuna WAV"
    if (text.includes('hatfield') || text.includes('book') || text.includes('ngicela')) {
      return {
        intent: 'BOOK_RIDE',
        language: 'mixed_zu_en',
        confidence: 0.94,
        entities: { destination: 'Hatfield' },
        accessibility: { requiresAccessibleTier: text.includes('wav') || text.includes('wheelchair') },
        replyText: 'Ngiyakwazi ukukusiza. I am setting up your ride to Hatfield. Where should the driver pick you up?',
      };
    }

    if (text.includes('cancel') || text.includes('khansela')) {
      return {
        intent: 'CANCEL_RIDE',
        language: 'en',
        confidence: 0.98,
        entities: {},
        accessibility: {},
        replyText: 'I understand you want to cancel. Processing this securely now.',
      };
    }

    return {
      intent: 'GENERAL_CHAT',
      language: 'en',
      confidence: 0.85,
      entities: {},
      accessibility: {},
      replyText: 'I am here to help with your AfriRide experience. What do you need?',
    };
  }
}

export const aiProvider: AIProvider = new MockAIProvider();
