/**
 * Phase 8D: Adaptive Difficulty Engine
 * Adjusts task difficulty based on performance
 */

import { DifficultyLevel } from "./types"

export interface DifficultySignals {
  independentSuccess: boolean
  helpLevel: number
  responseTime: number // milliseconds
  retries: number
  transferSuccess?: boolean
  consecutiveSuccess: number
  masteryScore: number
}

/**
 * Evaluate if task difficulty is appropriate
 */
export function evaluateDifficulty(signals: DifficultySignals): {
  level: DifficultyLevel
  shouldAdjust: boolean
  adjustment: number // -1, 0, +1
} {
  const score = calculateDifficultyScore(signals)

  if (score < 2) {
    return { level: "TOO_EASY", shouldAdjust: true, adjustment: 1 }
  } else if (score < 4) {
    return { level: "OPTIMAL", shouldAdjust: false, adjustment: 0 }
  } else if (score < 7) {
    return { level: "CHALLENGING", shouldAdjust: false, adjustment: 0 }
  } else {
    return { level: "TOO_HARD", shouldAdjust: true, adjustment: -1 }
  }
}

function calculateDifficultyScore(signals: DifficultySignals): number {
  let score = 0

  // Independent success: 0-2 points
  if (signals.independentSuccess) {
    score += 0 // Easy
  } else {
    score += 2 // Hard
  }

  // Help level: 0-3 points
  if (signals.helpLevel === 0) {
    score += 0
  } else if (signals.helpLevel <= 2) {
    score += 1
  } else {
    score += 3
  }

  // Retries: 0-2 points
  if (signals.retries === 0) {
    score += 0
  } else if (signals.retries <= 1) {
    score += 1
  } else {
    score += 2
  }

  // Transfer success bonus: -1 point (easier is fine if transfer works)
  if (signals.transferSuccess === true) {
    score -= 1
  }

  // Consecutive success bonus: reduce score
  if (signals.consecutiveSuccess >= 3) {
    score -= 1
  } else if (signals.consecutiveSuccess >= 5) {
    score -= 2
  }

  return Math.max(0, score)
}

/**
 * Determine if should increase difficulty
 */
export function shouldIncreaseDifficulty(
  recentPerformances: DifficultySignals[]
): { should: boolean; confidence: number } {
  if (recentPerformances.length < 2) {
    return { should: false, confidence: 0.3 }
  }

  const last3 = recentPerformances.slice(-3)
  const successCount = last3.filter((p) => p.independentSuccess).length
  const avgHelpLevel = last3.reduce((sum, p) => sum + p.helpLevel, 0) / last3.length
  const transferSuccesses = last3.filter((p) => p.transferSuccess === true).length

  // Criteria for increase
  if (successCount >= 2 && avgHelpLevel <= 1 && transferSuccesses >= 1) {
    return { should: true, confidence: 0.85 }
  }

  if (last3.every((p) => p.independentSuccess) && avgHelpLevel === 0) {
    return { should: true, confidence: 0.9 }
  }

  return { should: false, confidence: 0.4 }
}

/**
 * Determine if should decrease difficulty
 */
export function shouldDecreaseDifficulty(
  recentPerformances: DifficultySignals[]
): { should: boolean; reason: string; confidence: number } {
  if (recentPerformances.length < 2) {
    return { should: false, reason: "INSUFFICIENT_DATA", confidence: 0.2 }
  }

  const last3 = recentPerformances.slice(-3)
  const failureCount = last3.filter((p) => !p.independentSuccess).length
  const avgHelpLevel = last3.reduce((sum, p) => sum + p.helpLevel, 0) / last3.length

  // Multiple failures
  if (failureCount >= 2) {
    return { should: true, reason: "REPEATED_FAILURES", confidence: 0.85 }
  }

  // High help needed
  if (avgHelpLevel >= 3) {
    return { should: true, reason: "HIGH_HELP_REQUIRED", confidence: 0.8 }
  }

  // Very long response times + failures
  const avgResponseTime = last3.reduce((sum, p) => sum + p.responseTime, 0) / last3.length
  if (avgResponseTime > 600000 && failureCount >= 1) {
    // 10+ minutes
    return { should: true, reason: "OVERLOAD_SIGNAL", confidence: 0.75 }
  }

  return { should: false, reason: "NONE", confidence: 0.3 }
}

/**
 * Calculate new difficulty level after adjustment
 */
export function adjustDifficulty(current: number, adjustment: number): number {
  const newLevel = current + adjustment
  return Math.max(1, Math.min(10, newLevel)) // Clamp 1-10
}

/**
 * Provide user-friendly message for difficulty change
 */
export function getDifficultyMessage(adjustment: number): string {
  if (adjustment === 1) {
    return "Das sitzt schon gut! Ich mache es ein bisschen schwieriger. 😎"
  } else if (adjustment === -1) {
    return "Die ist gerade ziemlich knifflig. Wir machen kurz eine einfachere und kommen dann zurück. 💪"
  }
  return "Perfekt! Weiter so! 🎯"
}
