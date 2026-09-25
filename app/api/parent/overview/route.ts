import { NextRequest, NextResponse } from "next/server"
import { generateParentOverview } from "@/lib/parent/parent-aggregator"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"
    const period = (request.nextUrl.searchParams.get("period") || "week") as "week" | "month"

    const overview = await generateParentOverview(userId, period)

    return NextResponse.json({
      success: true,
      overview,
    })
  } catch (error) {
    console.error("[Parent Overview Error]", error)
    return NextResponse.json(
      { error: "Failed to generate overview", success: false },
      { status: 500 }
    )
  }
}
