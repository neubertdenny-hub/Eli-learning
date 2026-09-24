/**
 * GET /api/reward/user?userId=X
 * Hole User Rewards (XP, Coins, Level)
 */

import { NextRequest, NextResponse } from "next/server"
import { getUserRewards } from "@/lib/gamification/reward-engine"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    const rewards = await getUserRewards(userId)

    return NextResponse.json({
      success: true,
      totalXp: rewards.totalXp,
      totalCoins: rewards.totalCoins,
      currentLevel: rewards.currentLevel,
    })
  } catch (error) {
    console.error("[Get User Rewards Error]", error)
    return NextResponse.json(
      { error: "Failed to get user rewards" },
      { status: 500 }
    )
  }
}
