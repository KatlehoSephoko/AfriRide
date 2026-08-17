import { StorageProvider } from './StorageProvider';
import { env } from '../../config/env.config';

/**
 * Development Mock: Simulates cloud storage URLs for local testing.
 * Do NOT use in production.
 */
export class MockStorageProvider implements StorageProvider {
  async generateUploadUrl(fileName: string, _contentType: string) {
    if (env.NODE_ENV === 'production') {
      throw new Error('MockStorageProvider cannot be used in production.');
    }
    const fakeKey = `mock-${Date.now()}-${fileName}`;
    return {
      uploadUrl: `http://localhost:${env.PORT}/mock-s3-upload/${fakeKey}`,
      fileUrl: `https://mock-storage.afriride.local/${fakeKey}`
    };
  }
}

// In production, this would export an S3StorageProvider instantiated with credentials.
export const storageProvider: StorageProvider = new MockStorageProvider();
