import { NextRequest, NextResponse } from "next/server"
import { getDailyChallenges } from "@/lib/gamification/daily-challenges"

/**
 * POST /api/challenges/init
 * Initialize daily challenges for a user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const challenges = getDailyChallenges(userId)

    return NextResponse.json({
      success: true,
      message: `Initialized ${challenges.length} challenges for ${userId}`,
      challenges: challenges.map((c) => ({
        id: c.id,
        title: c.title,
        target: c.target,
      })),
    })
  } catch (error) {
    console.error("Error initializing challenges:", error)
    return NextResponse.json(
      { error: "Failed to initialize challenges" },
      { status: 500 }
    )
  }
}
