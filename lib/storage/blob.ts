/**
 * Vercel Blob Storage Client
 *
 * Handles temporary file uploads for documents and images.
 * Files are automatically deleted after 7 days.
 */

import { put, del, head } from "@vercel/blob"
import { Readable } from "stream"

interface BlobUploadOptions {
  contentType?: string
  token?: string
}

interface BlobMetadata {
  url: string
  pathname: string
  contentType: string
  contentLength: number
}

class BlobStorageClient {
  private token: string
  private readonly maxFileSizeMB = 10
  private readonly maxFileSizeBytes = this.maxFileSizeMB * 1024 * 1024
  private readonly retentionDays = 7

  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN || ""
    if (!this.token) {
      console.warn("⚠ BLOB_READ_WRITE_TOKEN not set. Storage operations will fail.")
    }
  }

  /**
   * Upload file to Vercel Blob
   * Returns blob URL and pathname
   */
  async uploadFile(
    file: File | Buffer,
    filename: string,
    options?: BlobUploadOptions
  ): Promise<BlobMetadata> {
    if (!this.token) {
      throw new Error("Blob storage not configured. Set BLOB_READ_WRITE_TOKEN.")
    }

    // Validate file size
    let fileSize: number
    let buffer: Buffer
    let contentType = options?.contentType || "application/octet-stream"

    if (file instanceof File) {
      fileSize = file.size
      buffer = Buffer.from(await file.arrayBuffer())
      contentType = file.type || contentType
    } else {
      fileSize = file.length
      buffer = file
    }

    if (fileSize > this.maxFileSizeBytes) {
      throw new Error(
        `File too large: ${Math.round(fileSize / 1024 / 1024)}MB. Max: ${this.maxFileSizeMB}MB`
      )
    }

    // Generate unique pathname with timestamp
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const pathname = `uploads/${timestamp}-${randomStr}/${filename}`

    try {
      const blob = await put(pathname, buffer, {
        access: "private",
        contentType,
        token: options?.token || this.token,
        addRandomSuffix: false, // We generate our own suffix
      })

      console.log(`[BLOB] Uploaded: ${pathname}`)
      console.log(`  Size: ${Math.round(fileSize / 1024)}KB`)
      console.log(`  URL: ${blob.url}`)
      console.log(`  Retention: ${this.retentionDays} days`)

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType,
        contentLength: fileSize,
      }
    } catch (error) {
      console.error(`[BLOB] Upload failed:`, error)
      throw error
    }
  }

  /**
   * Download file from Vercel Blob
   */
  async downloadFile(pathname: string): Promise<Buffer> {
    if (!this.token) {
      throw new Error("Blob storage not configured.")
    }

    try {
      const response = await fetch(`https://blob.vercelusercontent.com/${pathname}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      console.error(`[BLOB] Download failed:`, error)
      throw error
    }
  }

  /**
   * Delete file from Vercel Blob
   * Called during cleanup or after analysis
   */
  async deleteFile(pathname: string): Promise<void> {
    if (!this.token) {
      console.warn("Cannot delete: Blob storage not configured.")
      return
    }

    try {
      await del(pathname, {
        token: this.token,
      })
      console.log(`[BLOB] Deleted: ${pathname}`)
    } catch (error) {
      console.error(`[BLOB] Delete failed:`, error)
      // Don't throw - deletion failures shouldn't block the app
    }
  }

  /**
   * Check if file exists in Blob
   */
  async fileExists(pathname: string): Promise<boolean> {
    if (!this.token) {
      return false
    }

    try {
      await head(pathname, {
        token: this.token,
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get public download URL for a blob file
   * (temporary - files are private by default)
   */
  getPublicUrl(pathname: string): string {
    return `https://blob.vercelusercontent.com/${pathname}`
  }

  /**
   * Calculate retention deadline for uploaded file
   */
  getExpirationDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + this.retentionDays)
    return date
  }

  /**
   * Validate if file type is allowed
   */
  isAllowedFileType(mimeType: string): boolean {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    return allowed.includes(mimeType)
  }
}

// Singleton instance
let storageInstance: BlobStorageClient | null = null

export function getStorage(): BlobStorageClient {
  if (!storageInstance) {
    storageInstance = new BlobStorageClient()
  }
  return storageInstance
}

export type { BlobMetadata }
