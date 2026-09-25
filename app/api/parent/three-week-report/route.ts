import { NextRequest, NextResponse } from "next/server"
import { generateThreeWeekReport } from "@/lib/parent/three-week-report"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"

    console.log(`[3-Week Report] Generating for ${userId}`)

    const report = await generateThreeWeekReport(userId)

    return NextResponse.json({
      success: true,
      report,
      message: "3-Week Effectiveness Report generated",
    })
  } catch (error) {
    console.error("[3-Week Report Error]", error)
    return NextResponse.json(
      { error: "Failed to generate report", success: false },
      { status: 500 }
    )
  }
}
