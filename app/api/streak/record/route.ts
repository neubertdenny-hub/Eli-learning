/**
 * POST /api/streak/record
 * Markiere einen Tag als "Lerntag"
 */

import { NextRequest, NextResponse } from "next/server"
import { recordLearningDay, getStreakMessage } from "@/lib/gamification/streak-engine"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    const result = await recordLearningDay(userId)
    const message = getStreakMessage(
      result.currentStreak,
      new Date().toISOString()
    )

    return NextResponse.json({
      success: true,
      currentStreak: result.currentStreak,
      bestStreak: result.bestStreak,
      isNewDay: result.isNewDay,
      message,
    })
  } catch (error) {
    console.error("[Streak API Error]", error)
    return NextResponse.json(
      { error: "Failed to record streak" },
      { status: 500 }
    )
  }
}
