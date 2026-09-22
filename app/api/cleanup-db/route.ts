import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

export async function GET(request: NextRequest) {
  try {
    const secret = request.headers.get("x-cleanup-secret") || new URL(request.url).searchParams.get("secret")
    const cronSecret = process.env.CRON_SECRET

    if (secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })

    const dropStatements = [
      "DROP TABLE IF EXISTS documents CASCADE",
      "DROP TABLE IF EXISTS foundation_dependencies CASCADE",
      "DROP TABLE IF EXISTS foundations CASCADE",
      "DROP TABLE IF EXISTS sessions CASCADE",
      "DROP TABLE IF EXISTS topics CASCADE",
      "DROP TABLE IF EXISTS users CASCADE",
    ]

    for (const stmt of dropStatements) {
      await pool.query(stmt)
    }

    await pool.end()

    return NextResponse.json({
      success: true,
      message: "Database cleanup completed"
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
