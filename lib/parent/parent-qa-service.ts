/**
 * Phase 9G: Parent Coach Q&A Service
 * Answer parent questions about their child's learning based on Phase 8 data
 */

import { getDatabase } from "@/lib/db/connection"
import {
  adaptiveDecisions,
  learningStrategyStats,
  schoolAssessments,
} from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export interface ParentQuestion {
  userId: string
  question: string
  category?: "understanding" | "progress" | "strategy" | "difficulty" | "general"
}

export interface QAResponse {
  answer: string
  category: string
  evidence: string[]
  confidence: number
  recommendedNextStep?: string
}

/**
 * Main Q&A handler - routes questions based on content
 */
export async function answerParentQuestion(
  input: ParentQuestion
): Promise<QAResponse> {
  const { userId, question } = input

  // Categorize question
  const category = categorizeQuestion(question)

  // Fetch relevant data from Phase 8
  const data = await fetchLearningData(userId)

  // Generate evidence-based answer
  const answer = generateAnswer(question, category, data)

  return answer
}

/**
 * Categorize parent question
 */
function categorizeQuestion(
  question: string
): "understanding" | "progress" | "strategy" | "difficulty" | "general" {
  const q = question.toLowerCase()

  if (
    q.includes("why") ||
    q.includes("understand") ||
    q.includes("confused") ||
    q.includes("fehler")
  ) {
    return "understanding"
  }
  if (
    q.includes("progress") ||
    q.includes("improve") ||
    q.includes("fortschritt") ||
    q.includes("besser")
  ) {
    return "progress"
  }
  if (
    q.includes("strategy") ||
    q.includes("help") ||
    q.includes("how to") ||
    q.includes("wie")
  ) {
    return "strategy"
  }
  if (
    q.includes("hard") ||
    q.includes("schwer") ||
    q.includes("difficulty") ||
    q.includes("easy")
  ) {
    return "difficulty"
  }

  return "general"
}

/**
 * Fetch learning data from Phase 8
 */
async function fetchLearningData(userId: string) {
  const db = getDatabase()

  const [recentDecisions, strategyStats, recentAssessments] = await Promise.all(
    [
      db
        .select()
        .from(adaptiveDecisions)
        .where(eq(adaptiveDecisions.userId, userId))
        .orderBy(desc(adaptiveDecisions.createdAt))
        .limit(20),

      db
        .select()
        .from(learningStrategyStats)
        .where(eq(learningStrategyStats.userId, userId))
        .limit(12),

      db
        .select()
        .from(schoolAssessments)
        .where(eq(schoolAssessments.userId, userId))
        .orderBy(desc(schoolAssessments.date))
        .limit(5),
    ]
  )

  return {
    recentDecisions,
    strategyStats,
    recentAssessments,
  }
}

/**
 * Generate evidence-based answer
 */
function generateAnswer(
  question: string,
  category: string,
  data: any
): QAResponse {
  const { recentDecisions, strategyStats, recentAssessments } = data

  // Extract key insights
  const commonErrors = extractCommonErrors(recentDecisions)
  const effectiveStrategies = findEffectiveStrategies(strategyStats)
  const recentPerformance = analyzeRecentPerformance(recentDecisions)

  let answer = ""
  const evidence: string[] = []

  if (category === "understanding") {
    // Why questions
    answer = `Basierend auf Zoeys Trainings-Daten: ${commonErrors.join(
      ", "
    )}. Die nächsten Trainings werden auf diese Grundlagen fokussieren.`
    evidence.push(
      `In den letzten 20 Trainings: ${commonErrors.length} häufige Fehler erkannt`
    )
  } else if (category === "progress") {
    // Progress questions
    const trend = recentPerformance.trend || "stable"
    answer = `Zoeys Fortschritt ist ${trend}. ${effectiveStrategies.length > 0 ? `Besonders hilfreich: ${effectiveStrategies[0]}.` : ""}`
    evidence.push(`Trend basierend auf ${recentDecisions.length} Entscheidungen`)
  } else if (category === "strategy") {
    // How to help questions
    answer = `Die beste Unterstützung: ${effectiveStrategies[0] || "Schritt-für-Schritt-Erklärungen"}. Versuch, mehr Sachaufgaben zu zeigen.`
    evidence.push(
      `${effectiveStrategies.length} effektive Strategien identifiziert`
    )
  } else if (category === "difficulty") {
    // Too hard/easy questions
    answer = `Das Training passt sich automatisch an. Wenn es zu schwer ist, wir bauen einfachere Aufgaben ein. Zu leicht? Wir erhöhen die Anforderungen.`
    evidence.push(`Adaptive Difficulty aktiv: ${recentDecisions.length} Anpassungen`)
  } else {
    answer = `Basierend auf Zoeys Trainings-Daten zeigt sich, dass sie bei ${commonErrors[0] || "Fokusthemen"} unterstützung braucht.`
    evidence.push(`${recentDecisions.length} Trainingseinheiten analysiert`)
  }

  return {
    answer,
    category,
    evidence,
    confidence: Math.min(0.9, recentDecisions.length / 30), // More data = higher confidence
    recommendedNextStep:
      category === "understanding"
        ? "Foundation check für die erkannten Lücken durchführen"
        : category === "progress"
          ? "Weitermachen - der Trend ist positiv"
          : "Nächstes Training aktiv beteiligt sein",
  }
}

/**
 * Extract common error patterns from decisions
 */
function extractCommonErrors(decisions: any[]): string[] {
  const errors = new Map<string, number>()

  decisions.forEach((d) => {
    if (d.reasonCode?.includes("ERROR")) {
      const topic = d.topicId || "Unknown"
      errors.set(topic, (errors.get(topic) || 0) + 1)
    }
  })

  return Array.from(errors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((e) => e[0])
}

/**
 * Find effective strategies from stats
 */
function findEffectiveStrategies(strategies: any[]): string[] {
  return strategies
    .filter((s) => s.efficacyScore > 0.7)
    .map((s) => s.strategyName)
    .slice(0, 3)
}

/**
 * Analyze recent performance trend
 */
function analyzeRecentPerformance(decisions: any[]): {
  trend: "improving" | "stable" | "declining"
  successRate: number
} {
  if (decisions.length < 5) {
    return { trend: "stable", successRate: 0.5 }
  }

  const recent = decisions.slice(0, 5)
  const older = decisions.slice(5, 10)

  const recentSuccess = recent.filter((d) =>
    d.reasonCode?.includes("SUCCESS")
  ).length
  const olderSuccess = older.filter((d) =>
    d.reasonCode?.includes("SUCCESS")
  ).length

  const trend =
    recentSuccess > olderSuccess
      ? "improving"
      : recentSuccess < olderSuccess
        ? "declining"
        : "stable"

  return {
    trend,
    successRate: recentSuccess / recent.length,
  }
}
