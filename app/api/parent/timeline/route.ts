import { NextRequest, NextResponse } from "next/server"
import { generateTimeline, TimelineRange } from "@/lib/parent/long-term-timeline"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"
    const range = (request.nextUrl.searchParams.get("range") || "21day") as TimelineRange

    const timeline = await generateTimeline(userId, range)

    return NextResponse.json({
      success: true,
      timeline,
    })
  } catch (error) {
    console.error("[Timeline Error]", error)
    return NextResponse.json(
      { error: "Failed to generate timeline", success: false },
      { status: 500 }
    )
  }
}
