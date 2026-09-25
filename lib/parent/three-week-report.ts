/**
 * Phase 9K: 3-Week Effectiveness Report
 * Original MVP metric: measure real learning impact over 3 weeks
 */

import { getDatabase } from "@/lib/db/connection"
import {
  learningEffectivenessSnapshots,
  schoolAssessments,
} from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export interface ThreeWeekReport {
  period: string
  startDate: string
  endDate: string
  baselineKPIs: Record<string, number>
  currentKPIs: Record<string, number>
  improvements: Record<string, { before: number; after: number; change: number; percentage: number }>
  overallScore: number
  effectiveness: "excellent" | "good" | "average" | "needs_support"
  keyFindings: string[]
  recommendations: string[]
}

/**
 * Generate 3-week effectiveness report
 */
export async function generateThreeWeekReport(
  userId: string
): Promise<ThreeWeekReport> {
  const db = getDatabase()

  const now = new Date()
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)

  // Get baseline (from 3 weeks ago) and current snapshots
  const snapshots = await db
    .select()
    .from(learningEffectivenessSnapshots)
    .where(eq(learningEffectivenessSnapshots.userId, userId))
    .orderBy(desc(learningEffectivenessSnapshots.createdAt))
    .limit(20)

  const baselineSnapshot = (snapshots || []).find(
    (s) => new Date(s.periodEnd) <= threeWeeksAgo
  )
  const currentSnapshot = (snapshots || [])[0]

  const baselineKPIs = baselineSnapshot
    ? JSON.parse(baselineSnapshot.metrics || "{}")
    : getDefaultBaseline()
  const currentKPIs = currentSnapshot
    ? JSON.parse(currentSnapshot.metrics || "{}")
    : getDefaultBaseline()

  // Calculate improvements
  const improvements = calculateImprovements(baselineKPIs, currentKPIs)
  const overallScore = calculateOverallScore(improvements)

  // Get exam data for real-world validation
  const exams = await db
    .select()
    .from(schoolAssessments)
    .where(eq(schoolAssessments.userId, userId))

  const recentExams = (exams || []).filter(
    (e) => new Date(e.date) > threeWeeksAgo
  )

  const keyFindings = generateKeyFindings(
    improvements,
    overallScore,
    recentExams
  )
  const recommendations = generateRecommendations(improvements, keyFindings)

  return {
    period: "3 Wochen",
    startDate: threeWeeksAgo.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
    baselineKPIs,
    currentKPIs,
    improvements,
    overallScore,
    effectiveness: getEffectivenessRating(overallScore),
    keyFindings,
    recommendations,
  }
}

/**
 * Default baseline KPIs
 */
function getDefaultBaseline(): Record<string, number> {
  return {
    independentSuccessRate: 0.5,
    helpLevel: 0.6,
    transferSuccessRate: 0.3,
    retentionRate: 0.5,
    activeLearningMinutes: 0,
  }
}

/**
 * Calculate improvements between baseline and current
 */
function calculateImprovements(
  baseline: Record<string, number>,
  current: Record<string, number>
): Record<string, { before: number; after: number; change: number; percentage: number }> {
  const improvements: Record<string, any> = {}

  for (const [key, beforeValue] of Object.entries(baseline)) {
    const afterValue = current[key] || beforeValue
    const change = afterValue - beforeValue
    const percentage = beforeValue > 0 ? (change / beforeValue) * 100 : 0

    improvements[key] = {
      before: Math.round(beforeValue * 100) / 100,
      after: Math.round(afterValue * 100) / 100,
      change: Math.round(change * 100) / 100,
      percentage: Math.round(percentage),
    }
  }

  return improvements
}

/**
 * Calculate overall effectiveness score (0-1)
 */
function calculateOverallScore(
  improvements: Record<string, any>
): number {
  const weights = {
    independentSuccessRate: 0.35,
    transferSuccessRate: 0.25,
    retentionRate: 0.2,
    helpLevel: -0.1, // Lower is better
    activeLearningMinutes: 0.1,
  }

  let score = 0
  for (const [metric, weight] of Object.entries(weights)) {
    if (improvements[metric]) {
      const improvement = improvements[metric]
      const metricScore = Math.min(1, Math.max(0, improvement.after))
      score += metricScore * weight
    }
  }

  return Math.max(0, Math.min(1, score))
}

/**
 * Get effectiveness rating
 */
function getEffectivenessRating(
  score: number
): "excellent" | "good" | "average" | "needs_support" {
  if (score >= 0.8) return "excellent"
  if (score >= 0.6) return "good"
  if (score >= 0.4) return "average"
  return "needs_support"
}

/**
 * Generate key findings
 */
function generateKeyFindings(
  improvements: Record<string, any>,
  score: number,
  recentExams: any[]
): string[] {
  const findings: string[] = []

  // Check independent success improvement
  if (
    improvements.independentSuccessRate?.percentage > 10
  ) {
    findings.push(
      `📈 Unabhängige Lösungsquote um ${improvements.independentSuccessRate.percentage}% gestiegen`
    )
  }

  // Check transfer success
  if (
    improvements.transferSuccessRate?.percentage > 15
  ) {
    findings.push(
      `🎯 Transfer-Erfolg stark verbessert (+${improvements.transferSuccessRate.percentage}%)`
    )
  }

  // Check help level decrease
  if (
    improvements.helpLevel?.percentage < -20
  ) {
    findings.push(
      `💪 Zoey braucht weniger Hilfe (${improvements.helpLevel.percentage}% weniger)`
    )
  }

  // Check exam performance
  if (recentExams.length > 0) {
    const avgGrade = recentExams
      .map((e) => parseFloat(e.grade || "3"))
      .reduce((a, b) => a + b, 0) / recentExams.length
    if (avgGrade <= 2.5) {
      findings.push(`🏆 Schulnoten verbessert: Durchschnitt ${avgGrade.toFixed(1)}`)
    }
  }

  if (findings.length === 0) {
    findings.push("Weiterhin regelmäßiges Training empfohlen")
  }

  return findings
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  improvements: Record<string, any>,
  findings: string[]
): string[] {
  const recommendations: string[] = []

  if (improvements.transferSuccessRate?.percentage < 10) {
    recommendations.push(
      "Fokus auf Anwendungsaufgaben erhöhen - Transfer braucht mehr Praxis"
    )
  }

  if (improvements.independentSuccessRate?.percentage < 5) {
    recommendations.push(
      "Mehr Grundlagen-Arbeit nötig - fehlendes Vertrauen bei unabhängiger Lösung"
    )
  }

  if (improvements.helpLevel?.percentage > -10) {
    recommendations.push(
      "Graduelle Reduktion der Hilfe versuchen - Selbstständigkeit fördern"
    )
  }

  if (recommendations.length === 0) {
    recommendations.push("Bisherige Strategie gut funktioniert - weitermachen")
  }

  return recommendations
}
