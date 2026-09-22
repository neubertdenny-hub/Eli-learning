/**
 * POST /api/upload
 *
 * Handles file upload with real Vercel Blob storage and database.
 *
 * Flow:
 * 1. Validate file (type, size)
 * 2. Store in Vercel Blob (7-day retention)
 * 3. Save metadata to PostgreSQL
 * 4. Return documentId for later analysis
 */

import { NextRequest, NextResponse } from "next/server"
import { getStorage } from "@/lib/storage/blob"
import { getDatabase, initializeDatabase } from "@/lib/db/postgres"

const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

interface UploadResponse {
  success: boolean
  documentId?: string
  storageUrl?: string
  message: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Initialize database connection
    const db = getDatabase()
    const storage = getStorage()

    // Get userId from header (would come from auth in production)
    const userId = request.headers.get("x-user-id") as string | null
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required", message: "Missing authentication" },
        { status: 401 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
          message: "Please select a file to upload",
        },
        { status: 400 }
      )
    }

    // ========== VALIDATION ==========

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
          message: "File type not supported",
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Max: ${MAX_FILE_SIZE_MB}MB`,
          message: "File is too large",
        },
        { status: 413 }
      )
    }

    // ========== STORAGE ==========

    console.log(`[UPLOAD] Storing file: ${file.name}`)

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const blobMetadata = await storage.uploadFile(fileBuffer, file.name, {
      contentType: file.type,
    })

    // ========== DATABASE ==========

    const expiresAt = storage.getExpirationDate()

    const docMetadata = await db.createDocumentMetadata(
      userId,
      file.type === "application/pdf" ? "pdf" : "image",
      blobMetadata.pathname,
      file.size,
      expiresAt
    )

    console.log(`[UPLOAD] Database record created: ${docMetadata.id}`)

    // ========== RESPONSE ==========

    const response: UploadResponse = {
      success: true,
      documentId: docMetadata.id,
      storageUrl: blobMetadata.url,
      message: "File uploaded successfully. Ready for analysis.",
    }

    return NextResponse.json(response, { status: 202 })
  } catch (error) {
    console.error("[UPLOAD] Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Upload failed. Please try again.",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload?documentId=...
 * Check upload/analysis status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const db = getDatabase()
    const documentId = request.nextUrl.searchParams.get("documentId") as string | null

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Missing documentId parameter" },
        { status: 400 }
      )
    }

    const doc = await db.getDocument(documentId)

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        documentId: doc.id,
        status: doc.analysis_status,
        analysis: doc.analysis_result,
        uploadedAt: doc.upload_timestamp,
        expiresAt: doc.expires_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[UPLOAD GET] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    )
  }
}
