export interface AIInput {
  text: string;
  audioTranscription?: string;
  context: {
    userId: string;
    rideId?: string;
    currentScreen?: string;
    accessibilityProfile?: any;
  };
}

export interface AIResponse {
  intent: string; // e.g., 'BOOK_RIDE', 'CANCEL_RIDE', 'CHAT', 'EMERGENCY'
  language: string;
  confidence: number;
  entities: Record<string, any>;
  accessibility: {
    requiresAccessibleTier?: boolean;
  };
  replyText: string;
}

export interface AIProvider {
  understand(input: AIInput): Promise<AIResponse>;
}
