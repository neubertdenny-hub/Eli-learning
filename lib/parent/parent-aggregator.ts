/**
 * Phase 9A: Parent Data Aggregation
 * Reads Phase 8 KPIs and creates parent-friendly insights
 */

import { getDatabase } from "@/lib/db/connection"
import { learningStrategyStats, skillMastery } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface ParentOverview {
  userId: string
  period: "week" | "month"
  activeLearningMinutes: number
  sessionsCompleted: number
  tasksAttempted: number
  independentSuccessRate: number
  averageHelpLevel: number
  transferSuccessRate: number
  topicsActive: number
  topicsMastered: number
  foundationGapsOpen: number
  insights: ParentInsight[]
  recommendations: ParentRecommendation[]
  dataConfidence: "LOW" | "MEDIUM" | "HIGH"
}

export interface ParentInsight {
  id: string
  type:
    | "IMPROVEMENT"
    | "NEEDS_PRACTICE"
    | "FOUNDATION_GAP"
    | "FOUNDATION_IMPROVED"
    | "HELP_DECREASING"
    | "TRANSFER_IMPROVING"
    | "POSSIBLE_FORGETTING"
    | "NOT_ENOUGH_DATA"
  topicId?: string
  title: string
  description: string
  evidence: string[]
  confidence: number // 0-1
  priority: number // 1-10 (higher = more important)
  actionable: boolean
}

export interface ParentRecommendation {
  id: string
  priority: number // 1-3 (only top 3)
  title: string
  reasoning: string
  suggestedAction: string
  topicsAffected: string[]
  estimatedTimeMinutes: number
}

/**
 * Generate parent overview for a week or month
 */
export async function generateParentOverview(
  userId: string,
  period: "week" | "month" = "week"
): Promise<ParentOverview> {
  const db = getDatabase()

  // Aggregate learning data (would come from Phase 4-8 logs in real implementation)
  // For now: placeholder values that show the structure

  const mastery = await db.select().from(skillMastery).where(eq(skillMastery.userId, userId))

  const strategies = await db
    .select()
    .from(learningStrategyStats)
    .where(eq(learningStrategyStats.userId, userId))

  // Calculate metrics
  const activeLearningMinutes = 127 // Would sum from session logs
  const sessionsCompleted = 8
  const tasksAttempted = 142
  const independentSuccessRate = 0.68
  const averageHelpLevel = 1.4
  const transferSuccessRate = 0.62
  const topicsActive = mastery.length
  const topicsMastered = mastery.filter((m) => (m.currentLevel || 0) >= 4).length
  const foundationGapsOpen = mastery.filter((m) => (m.currentLevel || 0) < 2).length

  // Generate insights
  const insights = generateInsights({
    userId,
    independentSuccessRate,
    averageHelpLevel,
    transferSuccessRate,
    foundationGapsOpen,
    mastery,
    strategies,
  })

  // Generate recommendations (max 3)
  const recommendations = generateRecommendations(insights, mastery).slice(0, 3)

  // Determine data confidence
  const sampleSize = tasksAttempted
  const dataConfidence =
    sampleSize < 20 ? "LOW" : sampleSize < 50 ? "MEDIUM" : "HIGH"

  return {
    userId,
    period,
    activeLearningMinutes,
    sessionsCompleted,
    tasksAttempted,
    independentSuccessRate,
    averageHelpLevel,
    transferSuccessRate,
    topicsActive,
    topicsMastered,
    foundationGapsOpen,
    insights,
    recommendations,
    dataConfidence: dataConfidence as any,
  }
}

function generateInsights(data: {
  userId: string
  independentSuccessRate: number
  averageHelpLevel: number
  transferSuccessRate: number
  foundationGapsOpen: number
  mastery: any[]
  strategies: any[]
}): ParentInsight[] {
  const insights: ParentInsight[] = []

  // Insight 1: Independence improving
  if (data.independentSuccessRate > 0.6) {
    insights.push({
      id: `insight-independence-${data.userId}`,
      type: "IMPROVEMENT",
      title: "Wird selbstständiger",
      description: `Zoey löst ${Math.round(data.independentSuccessRate * 100)}% der Aufgaben ohne Hilfe.`,
      evidence: [
        `${Math.round(data.independentSuccessRate * 100)}% unabhängige Lösungsquote`,
        "Mehrere Sessions beobachtet",
      ],
      confidence: 0.85,
      priority: 8,
      actionable: false,
    })
  }

  // Insight 2: Help level decreasing
  if (data.averageHelpLevel < 2) {
    insights.push({
      id: `insight-help-${data.userId}`,
      type: "HELP_DECREASING",
      title: "Benötigt weniger Unterstützung",
      description: `Durchschnittliche Hilfestufe: ${data.averageHelpLevel.toFixed(1)}`,
      evidence: ["Trend steigt nicht", "Stabilisiert sich auf niedrigem Niveau"],
      confidence: 0.8,
      priority: 7,
      actionable: false,
    })
  }

  // Insight 3: Foundation gaps
  if (data.foundationGapsOpen > 0) {
    insights.push({
      id: `insight-foundation-${data.userId}`,
      type: "FOUNDATION_GAP",
      title: "Grundlagen beobachten",
      description: `${data.foundationGapsOpen} Grundlagen zeigen noch Lücken.`,
      evidence: [
        "Wiederkehrende Fehler bei abhängigen Aufgaben",
        "ELI hat tiefere Ursachen identifiziert",
      ],
      confidence: 0.7,
      priority: 9,
      actionable: true,
    })
  }

  // Insight 4: Transfer improving
  if (data.transferSuccessRate > 0.5) {
    insights.push({
      id: `insight-transfer-${data.userId}`,
      type: "TRANSFER_IMPROVING",
      title: "Wendet Wissen an",
      description: `${Math.round(data.transferSuccessRate * 100)}% Transfer-Erfolgsquote zeigt echtes Verständnis.`,
      evidence: ["Transfer-Aufgaben regelmäßig erfolgreich", "Nicht nur Wiederholung"],
      confidence: 0.82,
      priority: 8,
      actionable: false,
    })
  }

  return insights.sort((a, b) => b.priority - a.priority)
}

function generateRecommendations(
  insights: ParentInsight[],
  mastery: any[]
): ParentRecommendation[] {
  const recommendations: ParentRecommendation[] = []

  // Find gaps needing attention
  const gapInsights = insights.filter((i) => i.type === "FOUNDATION_GAP")
  if (gapInsights.length > 0) {
    recommendations.push({
      id: "rec-foundation",
      priority: 1,
      title: "Grundlagen kurz überprüfen",
      reasoning: "Wiederkehrende Fehler deuten auf unsichere Grundlagen hin.",
      suggestedAction:
        "Diese Woche 2-3 kurze Überprüfungsaufgaben für die unsicheren Grundlagen einplanen.",
      topicsAffected: ["grundlagen"],
      estimatedTimeMinutes: 15,
    })
  }

  // Suggest focused practice
  recommendations.push({
    id: "rec-practice",
    priority: 2,
    title: "Transfer-Aufgaben einbauen",
    reasoning:
      "Transfer-Erfolgsquote ist gut, aber es gibt noch Raum für Verbesserung.",
    suggestedAction:
      "Nächste Woche mindestens 2-3 Transfer-Aufgaben für ein aktuelles Thema einplanen.",
    topicsAffected: ["aktuelles-thema"],
    estimatedTimeMinutes: 20,
  })

  // Review momentum
  recommendations.push({
    id: "rec-momentum",
    priority: 3,
    title: "Momentum nutzen",
    reasoning:
      "Zoey zeigt gute Fortschritte und wird selbstständiger. Das ist der richtige Moment.",
    suggestedAction:
      "Schwierigkeit leicht erhöhen. Zoey ist bereit für anspruchsvollere Aufgaben.",
    topicsAffected: ["alle"],
    estimatedTimeMinutes: 0,
  })

  return recommendations
}
