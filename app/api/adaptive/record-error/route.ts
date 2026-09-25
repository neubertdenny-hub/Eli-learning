import { NextRequest, NextResponse } from "next/server"
import { makeAdaptiveDecision, recordStrategyOutcome } from "@/lib/adaptive/decision-engine"
import type { AdaptiveDecisionContext } from "@/lib/adaptive/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, topic, taskId, errorType, attemptNumber, usedHelp } = body

    if (!userId || !topic) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Phase 8 Integration: Make adaptive decision
    const context: AdaptiveDecisionContext = {
      userId,
      taskId,
      topic,
      errorType,
      previousAttempts: attemptNumber,
      previousHelpLevels: usedHelp ? [1] : [],
      currentDifficulty: 5,
      masteryScore: 0.5,
      recentErrors: true,
    }

    const decision = await makeAdaptiveDecision(context)

    console.log(`[Adaptive Error Handler] ${userId}/${topic}: ${decision.selectedStrategy}`)

    return NextResponse.json({
      success: true,
      adaptiveStrategy: decision.selectedStrategy,
      helpLevel: decision.selectedHelpLevel,
      confidence: decision.confidence,
      message: decision.explanation,
    })
  } catch (error) {
    console.error("[Adaptive Record Error]", error)
    // Fallback: return safe default
    return NextResponse.json({
      success: false,
      adaptiveStrategy: "SIMPLE_TEXT",
      helpLevel: 1,
      confidence: 0.5,
    })
  }
}
