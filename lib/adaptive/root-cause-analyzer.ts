/**
 * Phase 8C: Root Cause Intelligence
 * Detects underlying foundation gaps causing repeated errors
 */

import { getDatabase } from "@/lib/db/connection"
import { skillMastery } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface RootCauseAnalysis {
  observedProblem: string
  possibleRootCause?: string
  confidence: number
  evidence: string[]
  recommendedAction: "CONTINUE" | "FOUNDATION_CHECK" | "BRIDGE_TASK" | "REVIEW"
  foundationsToCheck?: string[]
}

export interface ErrorChain {
  errors: Array<{ topic: string; errorType: string; timestamp: Date }>
  pattern: "ESCALATING" | "REPEATED" | "MIXED"
  chainLength: number
}

/**
 * Analyze if current error might stem from foundation gap
 */
export async function analyzeRootCause(
  userId: string,
  currentTopic: string,
  currentError: string,
  errorHistory: Array<{ topic: string; errorType: string; timestamp: Date }>
): Promise<RootCauseAnalysis> {
  const db = getDatabase()

  // Get mastery data for current topic
  const masteryData = await db
    .select()
    .from(skillMastery)
    .where(eq(skillMastery.userId, userId))

  const currentMastery = masteryData.find((m) => m.skillName === currentTopic)
  const evidence: string[] = []

  // Check 1: Repeated same error
  const recentErrors = errorHistory.slice(-3)
  const sameErrorCount = recentErrors.filter((e) => e.errorType === currentError).length
  if (sameErrorCount >= 2) {
    evidence.push(`Error "${currentError}" repeated ${sameErrorCount}x in last 3 attempts`)
  }

  // Check 2: Error chain pattern
  if (errorHistory.length >= 4) {
    const chain = detectErrorChain(errorHistory)
    if (chain.pattern === "ESCALATING") {
      evidence.push("Error pattern escalating - may indicate foundation gap")
    }
  }

  // Check 3: Low mastery with repeated errors
  if (currentMastery && currentMastery.currentLevel <= 1 && sameErrorCount >= 2) {
    evidence.push(
      `Low mastery (level ${currentMastery.currentLevel}) + repeated errors suggest foundation gap`
    )
  }

  // Check 4: Mixed error types might indicate broader gap
  const errorTypes = new Set(recentErrors.map((e) => e.errorType))
  if (errorTypes.size >= 2) {
    evidence.push(`Multiple error types (${errorTypes.size}) suggest broader foundation issue`)
  }

  // Determine confidence and recommendation
  let confidence = 0.4
  let recommendedAction: RootCauseAnalysis["recommendedAction"] = "CONTINUE"
  let rootCause: string | undefined

  if (evidence.length >= 2) {
    confidence = 0.7
    recommendedAction = "FOUNDATION_CHECK"
    rootCause = suggestRootCause(currentTopic, currentError)
  } else if (evidence.length === 1 && errorTypes.size >= 2) {
    confidence = 0.65
    recommendedAction = "FOUNDATION_CHECK"
  } else if (sameErrorCount >= 2) {
    confidence = 0.55
    recommendedAction = "BRIDGE_TASK"
  }

  return {
    observedProblem: currentError,
    possibleRootCause: rootCause,
    confidence,
    evidence,
    recommendedAction,
    foundationsToCheck: rootCause ? getRelatedFoundations(currentTopic, rootCause) : undefined,
  }
}

/**
 * Detect patterns in error sequence
 */
function detectErrorChain(errorHistory: Array<{ errorType: string; timestamp: Date }>): ErrorChain {
  const errors = errorHistory.map((e) => ({
    topic: "",
    errorType: e.errorType,
    timestamp: e.timestamp,
  }))

  const uniqueTypes = new Set(errors.map((e) => e.errorType))
  const isEscalating = errors.length >= 3 && uniqueTypes.size > errors.length / 2

  return {
    errors,
    pattern: isEscalating ? "ESCALATING" : uniqueTypes.size > 1 ? "MIXED" : "REPEATED",
    chainLength: errors.length,
  }
}

/**
 * Map current topic+error to likely foundation gap
 */
function suggestRootCause(topic: string, errorType: string): string {
  const causeMaps: Record<string, Record<string, string>> = {
    bruchrechnung: {
      common_denominator: "multiplication_facts",
      simplify: "division_facts",
      add_incorrect: "addition_foundation",
    },
    negative_zahlen: {
      sign_error: "integer_understanding",
      operation_order: "operation_precedence",
    },
    multiplikation: {
      wrong_result: "multiplication_facts",
      wrong_place: "place_value",
    },
    division: {
      wrong_result: "multiplication_facts",
      remainder_confusion: "subtraction",
    },
  }

  return causeMaps[topic]?.[errorType] || "general_arithmetic"
}

/**
 * Get foundations that should be checked for this root cause
 */
function getRelatedFoundations(topic: string, rootCause: string): string[] {
  const foundations: Record<string, string[]> = {
    multiplication_facts: ["1x1", "2x2", "5x5", "10er_reihe"],
    addition_foundation: ["basic_addition", "addition_10_20"],
    division_facts: ["division_by_5", "division_by_10"],
    place_value: ["ones_tens_hundreds"],
    integer_understanding: ["negative_basics", "number_line"],
    operation_precedence: ["order_of_operations"],
  }

  return foundations[rootCause] || []
}

/**
 * Quick check: does foundation need review?
 */
export async function quickFoundationCheck(
  userId: string,
  foundations: string[]
): Promise<{ needsReview: boolean; confidence: number; foundation?: string }> {
  const db = getDatabase()

  const masteries = await db
    .select()
    .from(skillMastery)
    .where(eq(skillMastery.userId, userId))

  for (const foundation of foundations) {
    const mastery = masteries.find((m) => m.skillName === foundation)
    if (!mastery || mastery.currentLevel < 2) {
      return {
        needsReview: true,
        confidence: mastery ? 0.8 : 0.6,
        foundation,
      }
    }
  }

  return { needsReview: false, confidence: 0.9 }
}

/**
 * After foundation check passes: don't retry old topic immediately
 * Instead, bridge to current task with foundation knowledge
 */
export function createBridgeTask(
  originalTopic: string,
  foundationTopic: string,
  difficulty: number
): { bridgeTask: string; difficulty: number } {
  return {
    bridgeTask: `${foundationTopic}_bridge_to_${originalTopic}`,
    difficulty: Math.max(1, difficulty - 1),
  }
}
