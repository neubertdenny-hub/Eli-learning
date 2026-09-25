import { NextRequest, NextResponse } from "next/server"
import {
  applyExamFeedbackToBaseline,
  replanWeekFromExamFeedback,
  generatePhase8OptimizationDirective,
} from "@/lib/parent/closed-loop-integration"
import type { ExamFeedback } from "@/lib/parent/closed-loop-integration"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, feedback } = body

    if (!userId || !feedback) {
      return NextResponse.json(
        { error: "Missing userId or feedback" },
        { status: 400 }
      )
    }

    console.log(`[Closed Loop] Applying feedback for ${userId}`)

    // 1. Update Phase 8 baseline with exam insights
    await applyExamFeedbackToBaseline(userId, feedback as ExamFeedback)

    // 2. Replan next week with foundation checks + transfer tasks
    await replanWeekFromExamFeedback(userId, feedback as ExamFeedback)

    // 3. Generate optimization directive for Phase 8
    const directive = generatePhase8OptimizationDirective(feedback as ExamFeedback)

    return NextResponse.json({
      success: true,
      message: "Closed loop activated - next week replanned based on exam insights",
      directive,
      summary: {
        foundationGapsIdentified: feedback.foundationGapsToCheck?.length || 0,
        transferGapsIdentified: feedback.transferGapTopics?.length || 0,
        nextWeekFocus:
          feedback.adaptiveSignals?.includes("TRANSFER_FAILURE") &&
          feedback.adaptiveSignals?.includes("REPEATED_ERROR_PATTERN")
            ? "Intensive foundation + transfer retraining"
            : "Targeted reinforcement",
      },
    })
  } catch (error) {
    console.error("[Closed Loop Error]", error)
    return NextResponse.json(
      { error: "Failed to apply closed loop", success: false },
      { status: 500 }
    )
  }
}
