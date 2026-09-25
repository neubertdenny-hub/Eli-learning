import { NextRequest, NextResponse } from "next/server"
import { generateWeeklyReport, saveWeeklyReport } from "@/lib/parent/weekly-report-service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"
    const weekStart = request.nextUrl.searchParams.get("weekStart")
      ? new Date(request.nextUrl.searchParams.get("weekStart")!)
      : undefined

    const report = await generateWeeklyReport(userId, weekStart)

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("[Weekly Report Error]", error)
    return NextResponse.json(
      { error: "Failed to generate weekly report", success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, weekStart } = body

    const report = await generateWeeklyReport(userId, weekStart ? new Date(weekStart) : undefined)
    await saveWeeklyReport(report)

    return NextResponse.json({
      success: true,
      reportId: report.id,
    })
  } catch (error) {
    console.error("[Save Weekly Report Error]", error)
    return NextResponse.json(
      { error: "Failed to save weekly report", success: false },
      { status: 500 }
    )
  }
}
