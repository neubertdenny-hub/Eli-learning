import { NextRequest, NextResponse } from "next/server"
import {
  generateExamLearningPlan,
  shouldAdjustPlan,
  type LearningPriority,
} from "@/lib/exam/learning-planner"
import type { TopicReadinessReport } from "@/lib/exam/readiness-engine"
import { generateId } from "@/lib/utils/id-generator"

interface GeneratePlanRequest {
  examId: string
  topicPriorities: LearningPriority[]
  readinessReports: TopicReadinessReport[]
  daysUntilExam: number
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePlanRequest = await request.json()
    const { examId, topicPriorities, readinessReports, daysUntilExam } = body

    if (!examId || !topicPriorities || !readinessReports || daysUntilExam === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (daysUntilExam < 1) {
      return NextResponse.json(
        { error: "Exam must be at least 1 day away" },
        { status: 400 }
      )
    }

    // Generate learning plan
    const learningPlan = generateExamLearningPlan(
      examId,
      topicPriorities,
      readinessReports,
      daysUntilExam
    )

    console.log(
      `[Learning Plan] Generated for exam ${examId}: ${learningPlan.dailyPlan.length} days, ${learningPlan.totalMinutesNeeded} total minutes`
    )

    return NextResponse.json({
      success: true,
      planId: learningPlan.id,
      plan: learningPlan,
      summary: {
        daysUntilExam,
        dailyItems: learningPlan.dailyPlan.length,
        totalMinutes: learningPlan.totalMinutesNeeded,
        recommendedDailyMinutes: learningPlan.recommendedDailyMinutes,
        phases: Object.keys(learningPlan.phase).filter(
          (k) => learningPlan.phase[k as keyof typeof learningPlan.phase]
        ),
        criticalTopics: learningPlan.criticalTopics,
      },
    })
  } catch (error) {
    console.error("[Learning Plan Error]", error)
    return NextResponse.json(
      { error: "Failed to generate learning plan" },
      { status: 500 }
    )
  }
}

/**
 * Check if plan needs adjustment
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, currentPlan, changeEvent } = body

    if (!currentPlan || !changeEvent) {
      return NextResponse.json(
        { error: "Missing plan or change event" },
        { status: 400 }
      )
    }

    const shouldAdjust = shouldAdjustPlan(currentPlan, changeEvent)

    console.log(
      `[Plan Adjustment Check] Plan ${planId}: ${shouldAdjust ? "requires adjustment" : "no change needed"}`
    )

    return NextResponse.json({
      success: true,
      shouldAdjust,
      reason: shouldAdjust
        ? `Triggered by ${changeEvent.type} on ${changeEvent.topicId}`
        : "Plan still valid",
    })
  } catch (error) {
    console.error("[Plan Adjustment Error]", error)
    return NextResponse.json(
      { error: "Failed to check plan adjustment" },
      { status: 500 }
    )
  }
}
