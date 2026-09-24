/**
 * GET /api/shop/unlocked?userId=X&level=Y
 * Hole freigeschaltete Items für einen User
 */

import { NextRequest, NextResponse } from "next/server"
import { getUnlockedItems, getUserCosmetics } from "@/lib/gamification/shop-engine"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const level = searchParams.get("level")

    if (!userId || !level) {
      return NextResponse.json(
        { error: "Missing userId or level" },
        { status: 400 }
      )
    }

    const userLevel = parseInt(level, 10)
    const unlockedItems = await getUnlockedItems(userId, userLevel)
    const equipped = await getUserCosmetics(userId)

    return NextResponse.json({
      success: true,
      unlockedItems,
      equipped,
    })
  } catch (error) {
    console.error("[Shop Unlocked Error]", error)
    return NextResponse.json(
      { error: "Failed to get unlocked items" },
      { status: 500 }
    )
  }
}
