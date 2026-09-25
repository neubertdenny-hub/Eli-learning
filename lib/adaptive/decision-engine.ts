/**
 * Phase 8B: Adaptive Decision Engine
 * Orchestrates all adaptive decisions
 */

import { getDatabase } from "@/lib/db/connection"
import { adaptiveDecisions } from "@/lib/db/schema"
import {
  AdaptiveDecisionContext,
  AdaptiveDecisionResult,
  ReasonCode,
  getConfidenceLevel,
} from "./types"
import { selectHelpStrategy, analyzeErrorPattern } from "./help-selector"
import { recordStrategyUse } from "./strategy-analyzer"

export async function makeAdaptiveDecision(
  context: AdaptiveDecisionContext
): Promise<AdaptiveDecisionResult> {
  try {
    // Route to appropriate decision engine
    const decision = await selectHelpStrategy(context)

    // Log decision
    await logAdaptiveDecision(context.userId, decision)

    return decision
  } catch (error) {
    console.error("[Adaptive Decision Error]", error)
    // Fallback to safe default
    return {
      decisionType: "HELP_STRATEGY",
      selectedHelpLevel: 1,
      confidence: 0.3,
      reasonCodes: ["LOW_AI_CONFIDENCE"],
      explanation: "Versuchen wir einen Hinweis.",
    }
  }
}

async function logAdaptiveDecision(
  userId: string,
  decision: AdaptiveDecisionResult
): Promise<void> {
  const db = getDatabase()

  try {
    await db.insert(adaptiveDecisions).values({
      id: `${userId}-${Date.now()}`,
      userId,
      sessionId: undefined,
      taskId: undefined,
      decisionType: decision.decisionType,
      selectedStrategy: decision.selectedStrategy,
      selectedHelpLevel: decision.selectedHelpLevel,
      confidence: decision.confidence,
      reasonCodes: JSON.stringify(decision.reasonCodes),
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Failed to log adaptive decision]", error)
  }
}

export async function recordStrategyOutcome(
  userId: string,
  strategy: string,
  wasSuccessful: boolean,
  context: {
    topicId?: string
    foundationId?: string
    errorType?: string
    delayedSuccess?: boolean
    transferSuccess?: boolean
  }
): Promise<void> {
  // Convert to proper strategy type and record
  const validStrategies = [
    "SIMPLE_TEXT",
    "STEP_BY_STEP",
    "CONCRETE_EXAMPLE",
    "EVERYDAY_EXAMPLE",
    "VISUAL_REPRESENTATION",
    "NUMBER_LINE",
    "WORKED_EXAMPLE",
    "BRIDGE_TASK",
    "READ_ALOUD",
    "TRY_FIRST",
    "SMALLER_NUMBERS",
    "DECOMPOSE_PROBLEM",
  ]

  if (validStrategies.includes(strategy)) {
    await recordStrategyUse(userId, strategy as any, {
      ...context,
      immediateSuccess: wasSuccessful,
    })
  }
}

export function determineConfidenceThreshold(decisionType: string): number {
  switch (decisionType) {
    case "HELP_STRATEGY":
      return 0.65
    case "DIFFICULTY":
      return 0.75
    case "FOUNDATION_CHECK":
      return 0.7
    default:
      return 0.6
  }
}

export async function shouldUseStrongerModel(
  confidence: number,
  decisionType: string
): Promise<boolean> {
  const threshold = determineConfidenceThreshold(decisionType)
  return confidence < threshold
}
