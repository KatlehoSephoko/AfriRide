import { env } from '../../config/env.config';

export interface KYCProvider {
  verifyIdentity(documentUrl: string, selfieUrl: string): Promise<{ verified: boolean, confidence: number, matchId: string }>;
}

export class MockKYCProvider implements KYCProvider {
  async verifyIdentity(documentUrl: string, selfieUrl: string) {
    if (env.NODE_ENV === 'production') {
      throw new Error('MockKYCProvider cannot be used in production. Implement SmileIdentity, Veriff, or AWS Rekognition.');
    }
    return { verified: true, confidence: 0.98, matchId: `mock-kyc-${Date.now()}` };
  }
}

export const kycProvider: KYCProvider = new MockKYCProvider();
