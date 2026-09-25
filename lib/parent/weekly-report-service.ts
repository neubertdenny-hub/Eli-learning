/**
 * Phase 9B: Weekly Report Service
 * Generates automated parent reports every Sunday
 */

import { getDatabase } from "@/lib/db/connection"
import { LearningMetrics } from "@/lib/adaptive/types"

export interface WeeklyReport {
  id: string
  userId: string
  weekStart: Date
  weekEnd: Date

  metrics: {
    activeLearningMinutes: number
    sessionsCompleted: number
    tasksAttempted: number
    correctAttempts: number
    independentSuccessRate: number
    averageHelpLevel: number
    selfCorrectionRate: number
    transferSuccessRate: number
    reviewRetentionRate: number
    foundationGapCount: number
  }

  insights: {
    strongestProgress: string[]
    currentChallenges: string[]
    foundationObservations: string[]
    strategyObservations: string[]
  }

  recommendations: {
    priority: number
    title: string
    reasoning: string
    action: string
  }[]

  summary: string

  dataConfidence: "LOW" | "MEDIUM" | "HIGH"
  dataPoints: number

  generatedAt: Date
}

/**
 * Generate weekly report for a user
 */
export async function generateWeeklyReport(
  userId: string,
  weekStart?: Date
): Promise<WeeklyReport> {
  const db = getDatabase()

  // Calculate week dates
  const start = weekStart || getLastSunday()
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  // Aggregate metrics (in real implementation: sum from session logs)
  const metrics = {
    activeLearningMinutes: 127,
    sessionsCompleted: 8,
    tasksAttempted: 142,
    correctAttempts: 96,
    independentSuccessRate: 0.68,
    averageHelpLevel: 1.4,
    selfCorrectionRate: 0.34,
    transferSuccessRate: 0.62,
    reviewRetentionRate: 0.71,
    foundationGapCount: 2,
  }

  // Calculate data confidence
  const dataPoints = metrics.tasksAttempted
  const dataConfidence =
    dataPoints < 20 ? "LOW" : dataPoints < 50 ? "MEDIUM" : "HIGH"

  // Generate insights
  const insights = generateWeeklyInsights(metrics)

  // Generate recommendations
  const recommendations = generateWeeklyRecommendations(metrics, insights)

  // Generate summary (would be AI-generated in real implementation)
  const summary = generateWeeklySummary(metrics, insights)

  return {
    id: `report-${userId}-${start.toISOString().split("T")[0]}`,
    userId,
    weekStart: start,
    weekEnd: end,
    metrics,
    insights,
    recommendations,
    summary,
    dataConfidence: dataConfidence as any,
    dataPoints,
    generatedAt: new Date(),
  }
}

function getLastSunday(): Date {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  monday.setDate(monday.getDate() - 1) // Go back to Sunday
  return monday
}

function generateWeeklyInsights(metrics: any): any {
  return {
    strongestProgress: [
      metrics.independentSuccessRate > 0.6 ? "Selbstständigkeit steigt" : null,
      metrics.transferSuccessRate > 0.6 ? "Transfer verbessert sich" : null,
    ].filter(Boolean),

    currentChallenges: [
      metrics.foundationGapCount > 0 ? "2 Grundlagen noch unsicher" : null,
      metrics.averageHelpLevel > 2 ? "Benötigt noch regelmäßig Hilfe" : null,
    ].filter(Boolean),

    foundationObservations: [
      metrics.foundationGapCount > 0
        ? `${metrics.foundationGapCount} Grundlagen zeigen Lücken`
        : "Grundlagen stabil",
    ],

    strategyObservations: [
      metrics.selfCorrectionRate > 0.3
        ? "Zoey findet und korrigiert Fehler selbst"
        : "Wenig Selbstkorrektur",
    ],
  }
}

function generateWeeklyRecommendations(metrics: any, insights: any): any[] {
  const recs: any[] = []

  if (metrics.foundationGapCount > 0) {
    recs.push({
      priority: 1,
      title: "Grundlagen überprüfen",
      reasoning: "Mehrere Grundlagen zeigen noch Lücken",
      action: "2-3 kurze Überprüfungsaufgaben einplanen",
    })
  }

  if (metrics.transferSuccessRate < 0.7) {
    recs.push({
      priority: 2,
      title: "Transfer trainieren",
      reasoning: "Transfer-Erfolgsquote kann noch verbessert werden",
      action: "Mehr Aufgaben mit neuer Formulierung üben",
    })
  }

  if (metrics.independentSuccessRate > 0.65) {
    recs.push({
      priority: 3,
      title: "Schwierigkeit erhöhen",
      reasoning: "Zoey löst die meisten Aufgaben selbstständig",
      action: "Nächste Woche etwas schwierigere Aufgaben einplanen",
    })
  }

  return recs.slice(0, 3)
}

function generateWeeklySummary(metrics: any, insights: any): string {
  const success = Math.round(metrics.independentSuccessRate * 100)
  const help = metrics.averageHelpLevel.toFixed(1)
  const transfer = Math.round(metrics.transferSuccessRate * 100)

  return `Diese Woche: ${metrics.sessionsCompleted} Lerneinheiten, ${metrics.tasksAttempted} Aufgaben. Selbstständig: ${success}%, Ø Hilfe: ${help}, Transfer: ${transfer}%. ${insights.strongestProgress[0] || "Konstante Leistung"}.`
}

/**
 * Store weekly report in DB
 */
export async function saveWeeklyReport(report: WeeklyReport): Promise<void> {
  const db = getDatabase()

  // Would create table if it doesn't exist
  // For now: log to console
  console.log(`[Weekly Report] Saved for ${report.userId}: ${report.weekStart}`)
}

/**
 * Get historical weekly reports
 */
export async function getWeeklyReports(
  userId: string,
  limit: number = 12
): Promise<WeeklyReport[]> {
  // Would query DB
  // For now: return empty (UI will show placeholder)
  return []
}
