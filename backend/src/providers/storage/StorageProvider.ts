/**
 * Abstract interface for Cloud Storage (e.g., AWS S3, Google Cloud Storage).
 * Prevents tight coupling to a specific cloud provider.
 */
export interface StorageProvider {
  /**
   * Generates a signed URL allowing the client to upload a file directly to cloud storage,
   * bypassing the Node.js backend to save bandwidth and improve performance.
   */
  generateUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }>;
}
