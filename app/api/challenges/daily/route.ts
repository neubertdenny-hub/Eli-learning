import { NextRequest, NextResponse } from "next/server"
import { getDailyChallenges } from "@/lib/gamification/daily-challenges"

/**
 * GET /api/challenges/daily
 * Bekomme aktuelle Daily Challenges + Progress für einen User
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const challenges = getDailyChallenges(userId)

    // Mock Progress (in Production: from DB)
    const challengesWithProgress = challenges.map(challenge => ({
      ...challenge,
      progress: Math.floor(Math.random() * challenge.target),
      completed: false,
      rewardsClaimed: false,
    }))

    return NextResponse.json({
      success: true,
      challenges: challengesWithProgress,
      bonusRewards: { xp: 0, coins: 0 },
      claimedCount: 0,
    })
  } catch (error) {
    console.error("Error fetching daily challenges:", error)
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/challenges/daily/progress
 * Update Challenge Progress
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, challengeId, amount = 1 } = body

    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: "Missing userId or challengeId" },
        { status: 400 }
      )
    }

    console.log(`[Challenge] ${userId} - ${challengeId}: +${amount}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating challenge progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
