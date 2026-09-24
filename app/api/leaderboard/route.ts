import { NextRequest, NextResponse } from "next/server"
import { getLeaderboard } from "@/lib/gamification/leaderboard"

/**
 * GET /api/leaderboard?userId=X&period=all-time
 * Bekomme Leaderboard Daten
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    const period = (req.nextUrl.searchParams.get("period") || "all-time") as "weekly" | "monthly" | "all-time"

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const leaderboard = getLeaderboard(userId, period)

    return NextResponse.json({
      success: true,
      leaderboard,
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}
