import { NextRequest, NextResponse } from "next/server"
import {
  generateWeeklyGoals,
  createNotification,
  generateExamNotifications,
  generateMilestoneNotifications,
} from "@/lib/parent/goals-notifications"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"
    const type = request.nextUrl.searchParams.get("type") || "goals"

    if (type === "goals") {
      const goals = await generateWeeklyGoals(userId)
      return NextResponse.json({
        success: true,
        goals,
        message: "Weekly goals for this week",
      })
    }

    return NextResponse.json(
      { error: "Unknown type", success: false },
      { status: 400 }
    )
  } catch (error) {
    console.error("[Goals Error]", error)
    return NextResponse.json(
      { error: "Failed to get goals", success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, notificationType, examTitle, transferFailures, foundationGaps } = body

    if (notificationType === "exam_feedback") {
      const notifications = generateExamNotifications(
        userId,
        examTitle,
        transferFailures || [],
        foundationGaps || []
      )
      return NextResponse.json({
        success: true,
        notifications,
        message: "Exam feedback notifications generated",
      })
    }

    if (notificationType === "milestone") {
      const { masteredTopics, streakDays } = body
      const notifications = generateMilestoneNotifications(
        userId,
        masteredTopics || [],
        streakDays || 0
      )
      return NextResponse.json({
        success: true,
        notifications,
        message: "Milestone notifications generated",
      })
    }

    return NextResponse.json(
      { error: "Unknown notification type", success: false },
      { status: 400 }
    )
  } catch (error) {
    console.error("[Goals POST Error]", error)
    return NextResponse.json(
      { error: "Failed to create notification", success: false },
      { status: 500 }
    )
  }
}
