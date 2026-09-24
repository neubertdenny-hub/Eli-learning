/**
 * POST /api/shop/equip
 * Equip ein Item für einen User
 */

import { NextRequest, NextResponse } from "next/server"
import { equipItem } from "@/lib/gamification/shop-engine"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, itemId, category } = body

    if (!userId || !itemId || !category) {
      return NextResponse.json(
        { error: "Missing userId, itemId, or category" },
        { status: 400 }
      )
    }

    const result = await equipItem(userId, itemId, category)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Equip Error]", error)
    return NextResponse.json(
      { error: "Failed to equip item" },
      { status: 500 }
    )
  }
}
