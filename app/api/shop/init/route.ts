/**
 * POST /api/shop/init
 * Initialisiere Shop Items in der DB
 */

import { NextRequest, NextResponse } from "next/server"
import { initializeShopItems } from "@/lib/gamification/shop-engine"

export async function POST(request: NextRequest) {
  try {
    await initializeShopItems()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Shop Init Error]", error)
    return NextResponse.json(
      { error: "Failed to initialize shop" },
      { status: 500 }
    )
  }
}
