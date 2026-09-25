/**
 * Phase 8I/8J: Shadow Mode & Controlled Activation
 * Test adaptive decisions before making them affect learning
 */

import { getDatabase } from "@/lib/db/connection"
import { adaptiveDecisions } from "@/lib/db/schema"

export interface ShadowModeEvent {
  taskId: string
  timestamp: Date
  adaptiveRecommendation: string
  recommendedHelpLevel: number
  actualStrategy: string
  actualHelpLevel: number
  taskSuccess: boolean
  recommendation_was_correct: boolean
}

/**
 * Record shadow mode decision for later analysis
 */
export async function recordShadowDecision(
  userId: string,
  taskId: string,
  adaptiveRecommendation: string,
  recommendedLevel: number,
  actualStrategy: string,
  actualLevel: number,
  wasSuccessful: boolean
): Promise<void> {
  const db = getDatabase()

  const wasRecommendationCorrect =
    actualStrategy === adaptiveRecommendation && actualLevel === recommendedLevel && wasSuccessful

  try {
    await db.insert(adaptiveDecisions).values({
      id: `shadow-${userId}-${taskId}-${Date.now()}`,
      userId,
      taskId,
      decisionType: "SHADOW_MODE",
      selectedStrategy: adaptiveRecommendation,
      selectedHelpLevel: recommendedLevel,
      confidence: 0,
      reasonCodes: JSON.stringify(["SHADOW_MODE", wasRecommendationCorrect ? "CORRECT" : "MISSED"]),
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Shadow mode logging error]", error)
  }
}

/**
 * Analyze shadow mode effectiveness
 */
export function analyzeShadowModePerformance(events: ShadowModeEvent[]): {
  totalEvents: number
  correctRecommendations: number
  correctRate: number
  confidence: number
  readyForActivation: boolean
} {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      correctRecommendations: 0,
      correctRate: 0,
      confidence: 0,
      readyForActivation: false,
    }
  }

  const correctCount = events.filter((e) => e.recommendation_was_correct).length
  const correctRate = correctCount / events.length
  const confidence = Math.min(0.95, correctRate) // Cap at 0.95

  // Ready for activation if:
  // - Tested on 50+ decisions
  // - At least 70% correct
  // - Spread across different task types
  const readyForActivation = events.length >= 50 && correctRate >= 0.7

  return {
    totalEvents: events.length,
    correctRecommendations: correctCount,
    correctRate,
    confidence,
    readyForActivation,
  }
}

/**
 * Toggle adaptive intelligence on/off
 */
export interface AdaptiveIntelligenceState {
  enabled: boolean
  mode: "SHADOW" | "ACTIVE" | "DISABLED"
  shadowModeReadiness: number // 0-1
  lastEvaluationDate?: Date
}

export function getAdaptiveIntelligenceState(
  shadowPerformance: number,
  userHasData: boolean
): AdaptiveIntelligenceState {
  // Start in SHADOW by default
  if (!userHasData) {
    return {
      enabled: false,
      mode: "DISABLED",
      shadowModeReadiness: 0,
    }
  }

  if (shadowPerformance < 0.7) {
    return {
      enabled: false,
      mode: "SHADOW",
      shadowModeReadiness: shadowPerformance,
    }
  }

  // Ready for activation
  return {
    enabled: true,
    mode: "ACTIVE",
    shadowModeReadiness: shadowPerformance,
    lastEvaluationDate: new Date(),
  }
}

/**
 * Fallback mechanism: if adaptive engine has problems, fall back to standard flow
 */
export function shouldFallbackToStandardFlow(error: Error | null, confidence: number): boolean {
  if (error) return true
  if (confidence < 0.4) return true
  return false
}
