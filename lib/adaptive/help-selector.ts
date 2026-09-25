/**
 * Phase 8B: Adaptive Help Selection Engine
 * Chooses best strategy based on learned patterns
 */

import {
  LearningStrategy,
  AdaptiveDecisionContext,
  AdaptiveDecisionResult,
  ReasonCode,
  getConfidenceLevel,
} from "./types"
import { getStrategyEffectiveness, getBestStrategyForContext } from "./strategy-analyzer"

export async function selectHelpStrategy(
  context: AdaptiveDecisionContext
): Promise<AdaptiveDecisionResult> {
  const { userId, topic, errorType, previousAttempts, previousHelpLevels, masteryScore } =
    context

  const reasonCodes: ReasonCode[] = []
  let selectedStrategy: LearningStrategy | null = null
  let helpLevel = 1
  let confidence = 0.5

  // 1. Check if this is first attempt
  if (previousAttempts === 0) {
    reasonCodes.push("FIRST_ATTEMPT")
    selectedStrategy = "TRY_FIRST"
    confidence = 0.9
    return {
      decisionType: "HELP_STRATEGY",
      selectedStrategy,
      selectedHelpLevel: 0,
      confidence,
      reasonCodes,
      explanation: "Versuche es erst selbst! 💪",
    }
  }

  // 2. Check if same error repeated
  if (previousAttempts > 1 && previousAttempts < 4) {
    reasonCodes.push("REPEATED_SAME_ERROR")
    // Try a different strategy
    const previousLevel = Math.max(...previousHelpLevels)
    if (previousLevel < 2) {
      selectedStrategy = "CONCRETE_EXAMPLE"
      helpLevel = 2
      confidence = 0.75
    } else if (previousLevel < 4) {
      selectedStrategy = "WORKED_EXAMPLE"
      helpLevel = 3
      confidence = 0.8
    } else {
      selectedStrategy = "DECOMPOSE_PROBLEM"
      helpLevel = 4
      confidence = 0.7
    }
  }

  // 3. Use learned best strategy if available
  if (!selectedStrategy && userId) {
    const bestStrategy = await getBestStrategyForContext(userId, {
      topic,
      errorType,
    })

    if (bestStrategy) {
      reasonCodes.push("STRATEGY_HIGH_SUCCESS")
      selectedStrategy = bestStrategy
      confidence = 0.85
      helpLevel = getHelpLevelForStrategy(bestStrategy)
    }
  }

  // 4. Fallback: mastery-based recommendation
  if (!selectedStrategy) {
    reasonCodes.push("INSUFFICIENT_DATA")
    const recommendation = getMasteryBasedStrategy(masteryScore)
    selectedStrategy = recommendation.strategy
    helpLevel = recommendation.level
    confidence = 0.6
  }

  return {
    decisionType: "HELP_STRATEGY",
    selectedStrategy,
    selectedHelpLevel: helpLevel,
    confidence,
    reasonCodes,
    explanation: `Versuchen wir es so: ${selectedStrategy}`,
  }
}

function getHelpLevelForStrategy(strategy: LearningStrategy): number {
  const levels: Record<LearningStrategy, number> = {
    SIMPLE_TEXT: 1,
    STEP_BY_STEP: 2,
    CONCRETE_EXAMPLE: 2,
    EVERYDAY_EXAMPLE: 2,
    VISUAL_REPRESENTATION: 2,
    NUMBER_LINE: 2,
    WORKED_EXAMPLE: 3,
    BRIDGE_TASK: 3,
    READ_ALOUD: 1,
    TRY_FIRST: 0,
    SMALLER_NUMBERS: 2,
    DECOMPOSE_PROBLEM: 3,
  }
  return levels[strategy]
}

function getMasteryBasedStrategy(
  masteryScore: number
): { strategy: LearningStrategy; level: number } {
  if (masteryScore < 0.3) {
    // Very weak - start simple
    return { strategy: "SIMPLE_TEXT", level: 1 }
  } else if (masteryScore < 0.5) {
    return { strategy: "STEP_BY_STEP", level: 2 }
  } else if (masteryScore < 0.7) {
    return { strategy: "CONCRETE_EXAMPLE", level: 2 }
  } else {
    return { strategy: "TRY_FIRST", level: 0 }
  }
}

export async function analyzeErrorPattern(
  userId: string,
  errorType: string,
  errorHistory: Array<{ attempt: number; errorType: string; timestamp: Date }>
): Promise<{ possibleRootCause?: string; confidence: number; needsFoundationCheck: boolean }> {
  // Check if same error repeated
  const lastThreeErrors = errorHistory.slice(-3)
  const sameErrorCount = lastThreeErrors.filter((e) => e.errorType === errorType).length

  if (sameErrorCount >= 2) {
    return {
      possibleRootCause: "REPEATED_ERROR_PATTERN",
      confidence: 0.85,
      needsFoundationCheck: true,
    }
  }

  // Check if errors escalating
  if (errorHistory.length >= 4) {
    const recentErrors = errorHistory.slice(-4)
    const errorTypes = new Set(recentErrors.map((e) => e.errorType))
    if (errorTypes.size >= 3) {
      return {
        possibleRootCause: "MULTIPLE_ERROR_TYPES",
        confidence: 0.7,
        needsFoundationCheck: true,
      }
    }
  }

  return {
    confidence: 0.4,
    needsFoundationCheck: false,
  }
}

export function shouldEscalateHelpLevel(
  currentLevel: number,
  previousLevels: number[],
  recentSuccess: boolean
): boolean {
  if (recentSuccess) return false
  if (currentLevel >= 4) return false // Don't go beyond hint level

  const averagePrevious = previousLevels.length > 0
    ? previousLevels.reduce((a, b) => a + b, 0) / previousLevels.length
    : 0

  // Escalate if current level hasn't helped and previous wasn't higher
  return currentLevel >= averagePrevious && currentLevel < 4
}
