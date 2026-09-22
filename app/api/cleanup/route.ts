/**
 * DELETE /api/cleanup
 *
 * Automatic cleanup of expired documents (7-day retention).
 *
 * Call this:
 * - As a Vercel Cron Job (vercel.json or vercel.ts)
 * - Every day at 00:00 UTC
 *
 * Deletes:
 * - Temporary files from Vercel Blob Storage
 * - Associated DocumentMetadata records
 *
 * Does NOT delete:
 * - Learning history (ErrorPatterns, Progress, ReviewSchedules)
 * - Sessions and TaskAttempts
 * - User data
 */

import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/postgres"
import { getStorage } from "@/lib/storage/blob"

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Security: verify this is a Vercel Cron call
    // In production, Vercel sets the 'x-vercel-cron-request' header
    const cronSecret = request.headers.get("authorization")
    const expectedSecret = `Bearer ${process.env.CRON_SECRET || "development"}`

    if (
      process.env.NODE_ENV === "production" &&
      cronSecret !== expectedSecret
    ) {
      console.warn("[CLEANUP] Unauthorized cron call")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("[CLEANUP] Starting document cleanup...")

    const db = getDatabase()
    const blob = getStorage()

    // Find all expired documents
    const expiredDocuments = await db.getExpiredDocuments()

    console.log(`[CLEANUP] Found ${expiredDocuments.length} expired documents`)

    let deletedFromBlob = 0
    let deletedFromDb = 0
    let errors = 0

    for (const doc of expiredDocuments) {
      try {
        // Delete from Blob Storage
        if (doc.storage_key) {
          try {
            await blob.deleteFile(doc.storage_key)
            deletedFromBlob++
            console.log(`[CLEANUP] Deleted from Blob: ${doc.storage_key}`)
          } catch (blobError) {
            console.error(
              `[CLEANUP] Failed to delete from Blob: ${doc.storage_key}`,
              blobError
            )
            // Continue even if Blob deletion fails
          }
        }

        // Mark as deleted in database
        await db.markDocumentDeleted(doc.id)
        deletedFromDb++
        console.log(`[CLEANUP] Marked deleted in DB: ${doc.id}`)
      } catch (err) {
        console.error(`[CLEANUP] Error processing document ${doc.id}:`, err)
        errors++
      }
    }

    // Clean up expired parent access sessions (older than 24 hours)
    const deletedSessions = await db.deleteExpiredParentSessions()
    console.log(
      `[CLEANUP] Deleted ${deletedSessions} expired parent sessions`
    )

    const result = {
      success: true,
      message: "Cleanup complete",
      deleted_from_blob: deletedFromBlob,
      deleted_from_db: deletedFromDb,
      deleted_sessions: deletedSessions,
      errors: errors,
      timestamp: new Date().toISOString(),
    }

    console.log("[CLEANUP] Complete:", result)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("[CLEANUP] Fatal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Cleanup failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
