import { NextRequest, NextResponse } from "next/server"
import { shouldAdjustPlan } from "@/lib/exam/learning-planner"

interface FeedbackEvent {
  examId: string
  type: "MINI_CHECK_RESULT" | "TRANSFER_RESULT" | "FOUNDATION_CLOSED" | "MASTERY_CHANGE"
  topicId?: string
  topicIds?: string[]
  score?: number
  passed?: boolean
  success?: boolean
  currentPlanId?: string
}

/**
 * Process test results and update readiness
 * Returns whether plan needs to be regenerated
 */
export async function POST(request: NextRequest) {
  try {
    const body: FeedbackEvent = await request.json()
    const {
      examId,
      type,
      topicId,
      topicIds,
      score,
      passed,
      success,
      currentPlanId,
    } = body

    if (!examId || !type) {
      return NextResponse.json(
        { error: "Missing examId or event type" },
        { status: 400 }
      )
    }

    // Log the event
    console.log(`[Exam Feedback] ${type} for exam ${examId}:`, {
      topic: topicId || topicIds,
      score,
      passed,
      success,
    })

    // Determine impact on learning plan
    let shouldReplan = false
    let reason = ""
    let priorityChange: Record<string, "increased" | "decreased" | "stable"> = {}

    if (type === "MINI_CHECK_RESULT") {
      // Score < 70% → Topic stays HIGH priority
      // Score >= 70% → Topic can move to MEDIUM/LOW
      // Score change > 15% → might need re-plan

      if (score !== undefined) {
        if (score < 70) {
          priorityChange[topicId || ""] = "increased"
          reason = `Mini-Check Score ${score}% < 70% → Keep HIGH Priority`
        } else if (score >= 85) {
          priorityChange[topicId || ""] = "decreased"
          reason = `Mini-Check Score ${score}% >= 85% → Can reduce focus`
          shouldReplan = true
        } else {
          priorityChange[topicId || ""] = "stable"
          reason = `Mini-Check Score ${score}% - stable`
        }
      }
    } else if (type === "TRANSFER_RESULT") {
      // Transfer success → principle understood
      // Transfer failure → need more foundation work

      if (success) {
        reason = `Transfer successful → Principle mastered`
        if (topicIds) {
          topicIds.forEach((tid) => {
            priorityChange[tid] = "decreased"
          })
        }
        shouldReplan = true
      } else {
        reason = `Transfer failed → Back to practice`
        if (topicIds) {
          topicIds.forEach((tid) => {
            priorityChange[tid] = "increased"
          })
        }
        shouldReplan = true
      }
    } else if (type === "FOUNDATION_CLOSED") {
      // Foundation gap is now filled
      reason = `Foundation gap closed → Ready for next phase`
      shouldReplan = true
    }

    // Decision logic for re-planning
    const decision = {
      shouldReplan,
      reason,
      priorityChanges: priorityChange,
      suggestedNextSteps: [] as string[],
    }

    if (shouldReplan) {
      decision.suggestedNextSteps = [
        "Regenerate learning plan with updated priorities",
        "Focus on topics with increased priority",
        "Consider transferring lower-priority topics to review phase",
      ]
    } else {
      decision.suggestedNextSteps = [
        "Continue with current plan",
        "Next scheduled activity",
      ]
    }

    console.log(`[Plan Adjustment] Decision: replan=${shouldReplan}`)

    return NextResponse.json({
      success: true,
      examId,
      feedbackEvent: body,
      decision,
    })
  } catch (error) {
    console.error("[Feedback Processing Error]", error)
    return NextResponse.json(
      { error: "Failed to process feedback" },
      { status: 500 }
    )
  }
}
