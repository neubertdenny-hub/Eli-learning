/**
 * POST /api/badge/check
 * Checke ob User neue Badges verdient hat
 */

import { NextRequest, NextResponse } from "next/server"
import { checkBadgeProgress, initializeBadges } from "@/lib/gamification/badge-engine"

export async function POST(request: NextRequest) {
  try {
    // Initalisiere Badges beim ersten Call
    await initializeBadges()

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    const newBadges = await checkBadgeProgress(userId)

    return NextResponse.json({
      success: true,
      newBadges,
      unlockedCount: newBadges.length,
    })
  } catch (error) {
    console.error("[Badge Check API Error]", error)
    return NextResponse.json(
      { error: "Failed to check badges" },
      { status: 500 }
    )
  }
}
