/**
 * Phase 8G: Learning Effectiveness & KPIs
 * Measures actual learning progress with key metrics
 */

import { LearningMetrics } from "./types"

export interface EffectivenessSnapshot {
  periodStart: Date
  periodEnd: Date
  periodDays: number
  metrics: LearningMetrics
  comparisonToPrevious?: {
    independentSuccessRateChange: number
    averageHelpLevelChange: number
    transferSuccessRateChange: number
  }
}

/**
 * Calculate core learning effectiveness metrics
 */
export function calculateLearningMetrics(data: {
  totalAttempts: number
  correctAttempts: number
  correctIndependent: number
  helpUsed: number
  selfCorrections: number
  transferSuccesses: number
  transferAttempts: number
  foundationGaps: number
  reviewRetentions: number
  reviewAttempts: number
  activeLearningMinutes: number
  masteredTopics: number
}): LearningMetrics {
  return {
    independentSuccessRate:
      data.totalAttempts > 0 ? data.correctIndependent / data.totalAttempts : 0,
    averageHelpLevel: data.totalAttempts > 0 ? data.helpUsed / data.totalAttempts : 0,
    selfCorrectionRate:
      data.totalAttempts > 0 ? data.selfCorrections / data.totalAttempts : 0,
    transferSuccessRate:
      data.transferAttempts > 0 ? data.transferSuccesses / data.transferAttempts : 0,
    foundationGapCount: data.foundationGaps,
    reviewRetentionRate:
      data.reviewAttempts > 0 ? data.reviewRetentions / data.reviewAttempts : 0,
    activeLearningTimeMinutes: data.activeLearningMinutes,
    masteredTopicsCount: data.masteredTopics,
    totalAttempts: data.totalAttempts,
    correctAttempts: data.correctAttempts,
  }
}

/**
 * Compare two snapshots to show progress
 */
export function compareSnapshots(
  previous: LearningMetrics,
  current: LearningMetrics
): {
  improved: string[]
  declined: string[]
  overall: number // -1 to +1
} {
  const improved: string[] = []
  const declined: string[] = []
  let overallScore = 0

  // Check each metric
  if (current.independentSuccessRate > previous.independentSuccessRate + 0.05) {
    improved.push("Selbstständige Lösungen")
    overallScore += 0.2
  } else if (current.independentSuccessRate < previous.independentSuccessRate - 0.05) {
    declined.push("Selbstständige Lösungen")
    overallScore -= 0.2
  }

  if (current.averageHelpLevel < previous.averageHelpLevel - 0.2) {
    improved.push("Benötigte Hilfe")
    overallScore += 0.2
  } else if (current.averageHelpLevel > previous.averageHelpLevel + 0.2) {
    declined.push("Benötigte Hilfe")
    overallScore -= 0.2
  }

  if (current.transferSuccessRate > previous.transferSuccessRate + 0.1) {
    improved.push("Transfer-Aufgaben")
    overallScore += 0.2
  } else if (current.transferSuccessRate < previous.transferSuccessRate - 0.1) {
    declined.push("Transfer-Aufgaben")
    overallScore -= 0.2
  }

  if (current.foundationGapCount < previous.foundationGapCount) {
    improved.push("Grundlagen geklärt")
    overallScore += 0.2
  } else if (current.foundationGapCount > previous.foundationGapCount) {
    declined.push("Neue Grundlückenlücken")
    overallScore -= 0.2
  }

  return {
    improved,
    declined,
    overall: Math.max(-1, Math.min(1, overallScore)),
  }
}

/**
 * Format metrics for parent dashboard
 */
export function formatMetricsForParents(metrics: LearningMetrics): {
  independentSuccessPercent: number
  averageHelpLevel: string
  transferSuccessPercent: number
  activeLearningHours: number
  masteredTopics: number
  foundationGaps: number
} {
  return {
    independentSuccessPercent: Math.round(metrics.independentSuccessRate * 100),
    averageHelpLevel:
      metrics.averageHelpLevel <= 0.5 ? "Minimal" : metrics.averageHelpLevel <= 2 ? "Moderat" : "Intensiv",
    transferSuccessPercent: Math.round(metrics.transferSuccessRate * 100),
    activeLearningHours: Math.round(metrics.activeLearningTimeMinutes / 60),
    masteredTopics: metrics.masteredTopicsCount,
    foundationGaps: metrics.foundationGapCount,
  }
}

/**
 * Determine if there's sufficient data for meaningful comparison
 */
export function hasSufficientData(attempts: number, days: number): boolean {
  // Need at least 10 attempts over at least 2 days
  return attempts >= 10 && days >= 2
}
