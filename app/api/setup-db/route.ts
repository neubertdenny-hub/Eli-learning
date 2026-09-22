import { NextRequest, NextResponse } from "next/server"
import { runMigration } from "@/lib/db/migrate"

export async function GET(request: NextRequest) {
  try {
    const secret = request.headers.get("x-setup-secret") || new URL(request.url).searchParams.get("secret")
    const setupSecret = process.env.SETUP_SECRET
    const cronSecret = process.env.CRON_SECRET
    const isAuthorized = secret === setupSecret || secret === cronSecret
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🚀 Running database migration...")
    await runMigration()

    return NextResponse.json({
      success: true,
      message: "Database migration completed successfully",
    })
  } catch (error) {
    console.error("Migration failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
