/**
 * POST /api/reward/process
 * Processiert einen Reward Event (XP, Coins, etc.)
 */

import { NextRequest, NextResponse } from "next/server"
import { processReward, type RewardEventType } from "@/lib/gamification/reward-engine"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventType, sourceId } = body

    if (!userId || !eventType || !sourceId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, eventType, sourceId" },
        { status: 400 }
      )
    }

    const reward = await processReward(userId, eventType as RewardEventType, sourceId)

    return NextResponse.json({
      success: true,
      xp: reward.xp,
      coins: reward.coins,
      levelUp: reward.leveledUp,
      newLevel: reward.newLevel,
    })
  } catch (error) {
    console.error("[Reward API Error]", error)
    return NextResponse.json(
      { error: "Failed to process reward" },
      { status: 500 }
    )
  }
}
