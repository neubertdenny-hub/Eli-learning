/**
 * Storage Client Interface (Blob Storage)
 *
 * For: Temporary files (photos, canvas images)
 * - Auto-delete after 7 days (TTL)
 * - Secure (no public URLs)
 * - Signed URLs for temporary access
 *
 * Current: Vercel Blob Storage
 */

export interface StorageClient {
  // ========== CONNECTION ==========
  connect(): Promise<void>
  health(): Promise<boolean>

  // ========== UPLOAD ==========
  upload(
    file: Blob | Buffer | ArrayBuffer,
    options?: {
      filename?: string
      contentType?: string
      ttlDays?: number
    }
  ): Promise<string> // Returns file ID

  // ========== DOWNLOAD / ACCESS ==========
  getSignedUrl(fileId: string, expiresInMinutes?: number): Promise<string>

  download(fileId: string): Promise<Buffer>

  // ========== DELETE ==========
  delete(fileId: string): Promise<boolean>

  // ========== METADATA ==========
  exists(fileId: string): Promise<boolean>

  getMetadata(fileId: string): Promise<{
    size: number
    uploadedAt: Date
    contentType: string
  } | null>
}

// ========== SINGLETON INSTANCE ==========

let storageClient: StorageClient | null = null

export async function initializeStorage(): Promise<StorageClient> {
  if (storageClient) {
    return storageClient
  }

  throw new Error("Storage client not initialized. Use setStorageClient() to provide implementation.")
}

export function setStorageClient(client: StorageClient) {
  storageClient = client
}

export function getStorage(): StorageClient {
  if (!storageClient) {
    throw new Error("Storage not initialized. Call initializeStorage() first.")
  }
  return storageClient
}

// ========== CONSTANTS ==========

export const STORAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  defaultTTL: 7, // days
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
}

export const FILE_TYPES = {
  PHOTO: "photo",
  CANVAS: "canvas",
  DOCUMENT: "document",
}
