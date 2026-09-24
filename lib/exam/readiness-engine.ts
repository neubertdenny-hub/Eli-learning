/**
 * Phase 7C: Exam Readiness Engine
 * Rule-basierte Berechnung der Prüfungsvorbereitung
 * Nicht LLM-basiert, nur Logik & Mastery-Daten
 */

import type { ExamTopic } from "@/lib/db/exam-schema"
import { calculateReadiness, type ReadinessStatus } from "@/lib/exam/exam-manager"

export interface TopicReadiness {
  topicId: string
  topicName: string            // Display name (von topicId oder separat)
  mastery: number              // 0-100: Beherrschungsgrad
  independentSuccessRate: number // 0-100: ohne Hinweise geschafft
  errorPatternCount: number    // Fehlertypen
  readiness: ReadinessStatus   // READY / NEEDS_REVIEW / NEEDS_PRACTICE / NOT_ASSESSED
  priority: "EXAM_PRIORITY" | "EXAM_WEAKNESS" | "EXAM_TRANSFER" | "EXAM_REVIEW"
  estimatedHours: number       // Geschätzte Lernzeit
  recommendedActivities: string[]
  confidence: number           // 0-1: Wie sicher die Readiness-Berechnung ist
}

export interface ExamReadinessPlan {
  examId: string
  overallReadiness: ReadinessStatus
  readinessScore: number       // 0-100: Gesamtbereicherung
  daysUntilExam: number
  topics: TopicReadiness[]
  priority: {
    examPriority: TopicReadiness[]    // Direkter Prüfungsstoff
    weaknesses: TopicReadiness[]      // Defizite
    transfer: TopicReadiness[]        // Transfer-Aufgaben
    review: TopicReadiness[]          // Sichere Themen kurz wiederholen
  }
  recommendedSchedule: {
    dailyHours: number               // Empfohlene tägliche Lernzeit
    totalRequiredHours: number       // Gesamtzeit für alles
    daysToComplete: number           // Tage die bleiben
    isAchievable: boolean            // Realistisch?
  }
}

/**
 * Berechne Readiness für ein einzelnes Topic
 */
export function calculateTopicReadiness(
  topic: ExamTopic & {
    mastery?: number
    independentSuccessRate?: number
    errorPatternCount?: number
    topicName?: string  // Optional: falls vorhanden, sonst topicId verwenden
  },
  daysUntilExam: number = 30
): TopicReadiness {
  const mastery = topic.mastery ?? 0
  const independentSuccessRate = topic.independentSuccessRate ?? 0
  const errorPatternCount = topic.errorPatternCount ?? 0

  const readiness = calculateReadiness(mastery, independentSuccessRate, errorPatternCount, daysUntilExam)

  // Priorität basierend auf sourceType
  let priority: TopicReadiness["priority"] = "EXAM_REVIEW"
  if (topic.sourceType === "CONFIRMED") {
    priority = mastery < 70 ? "EXAM_WEAKNESS" : "EXAM_PRIORITY"
  } else if (topic.sourceType === "LIKELY") {
    priority = "EXAM_TRANSFER"
  } else if (topic.sourceType === "FOUNDATION") {
    priority = mastery < 50 ? "EXAM_WEAKNESS" : "EXAM_REVIEW"
  }

  // Geschätzte Lernzeit (in Stunden)
  const estimatedHours = calculateEstimatedHours(mastery, readiness)

  // Empfohlene Aktivitäten basierend auf Readiness
  const recommendedActivities = getRecommendedActivities(readiness, mastery)

  // Confidence basierend darauf ob Mastery-Daten da sind
  const hasData = topic.mastery !== undefined || topic.independentSuccessRate !== undefined
  const confidence = hasData ? 0.8 : 0.3

  return {
    topicId: topic.id,
    topicName: topic.topicName ?? topic.topicId, // Fallback zu topicId als Display-Name
    mastery,
    independentSuccessRate,
    errorPatternCount,
    readiness,
    priority,
    estimatedHours,
    recommendedActivities,
    confidence,
  }
}

/**
 * Geschätzte Lernzeit für ein Topic
 */
function calculateEstimatedHours(mastery: number, readiness: ReadinessStatus): number {
  const baseHours = 2 // Basis: 2 Stunden pro Topic

  if (readiness === "READY") return 0.5 // Nur kurz wiederholen
  if (readiness === "NEEDS_REVIEW") return 1.5 // Mittel
  if (readiness === "NEEDS_PRACTICE") return 4 // Viel üben
  if (readiness === "NOT_ASSESSED") return 3 // Basis kennenlernen

  return baseHours
}

/**
 * Empfohlene Aktivitäten basierend auf Readiness
 */
function getRecommendedActivities(readiness: ReadinessStatus, mastery: number): string[] {
  const activities: string[] = []

  switch (readiness) {
    case "READY":
      activities.push("Schnelle Wiederholung (5-10 min)")
      activities.push("Teste dich mit Probe-Aufgaben")
      break

    case "NEEDS_REVIEW":
      activities.push("Konzepte nochmal durchgehen")
      activities.push("Typische Fehler üben")
      activities.push("10-15 Aufgaben lösen")
      break

    case "NEEDS_PRACTICE":
      activities.push("Grundlagen von vorne lernen")
      activities.push("Viele Aufgaben rechnen (20+)")
      activities.push("Häufige Fehler isoliert üben")
      activities.push("Transfer-Aufgaben machen")
      break

    case "NOT_ASSESSED":
      activities.push("Erstes Mal lernen - gründlich")
      activities.push("Beispiele + Erklärvideos anschauen")
      activities.push("Erste Aufgaben mit Hilfe")
      activities.push("Dann unabhängig üben")
      break
  }

  return activities
}

/**
 * Generiere kompletten Readiness-Plan für Klassenarbeit
 */
export function generateReadinessPlan(
  examId: string,
  topics: (ExamTopic & {
    mastery?: number
    independentSuccessRate?: number
    errorPatternCount?: number
    topicName?: string
  })[],
  daysUntilExam: number
): ExamReadinessPlan {
  // Berechne Readiness für alle Topics
  const topicReadiness = topics.map(t => calculateTopicReadiness(t, daysUntilExam))

  // Sortiere nach Priorität
  const examPriority = topicReadiness.filter(t => t.priority === "EXAM_PRIORITY")
  const weaknesses = topicReadiness.filter(t => t.priority === "EXAM_WEAKNESS").sort((a, b) => a.mastery - b.mastery)
  const transfer = topicReadiness.filter(t => t.priority === "EXAM_TRANSFER")
  const review = topicReadiness.filter(t => t.priority === "EXAM_REVIEW")

  // Berechne Gesamtzeit
  const totalRequiredHours = topicReadiness.reduce((sum, t) => sum + t.estimatedHours, 0)
  const availableHours = daysUntilExam * 2 // Annahme: 2 Stunden/Tag
  const dailyHours = Math.ceil(totalRequiredHours / Math.max(daysUntilExam, 1))
  const isAchievable = dailyHours <= 3 // Max 3 Stunden/Tag ist realistisch

  // Gesamtbereicherung (0-100)
  const avgMastery = topicReadiness.length > 0
    ? Math.round(topicReadiness.reduce((sum, t) => sum + t.mastery, 0) / topicReadiness.length)
    : 0

  // Mapppe Mastery zu Readiness
  let overallReadiness: ReadinessStatus = "NOT_ASSESSED"
  if (avgMastery >= 80 && weaknesses.length === 0) overallReadiness = "READY"
  else if (avgMastery >= 65 && weaknesses.length <= 2) overallReadiness = "NEEDS_REVIEW"
  else if (avgMastery < 65 || weaknesses.length > 3) overallReadiness = "NEEDS_PRACTICE"

  return {
    examId,
    overallReadiness,
    readinessScore: avgMastery,
    daysUntilExam,
    topics: topicReadiness,
    priority: {
      examPriority,
      weaknesses,
      transfer,
      review,
    },
    recommendedSchedule: {
      dailyHours,
      totalRequiredHours,
      daysToComplete: Math.ceil(totalRequiredHours / dailyHours),
      isAchievable,
    },
  }
}

/**
 * Bestimme nächstes zu lernendes Topic
 */
export function getNextTopicToLearn(plan: ExamReadinessPlan): TopicReadiness | null {
  // Priorität: Schwächen > Exam Priority > Transfer > Review
  const candidates = [
    ...plan.priority.weaknesses,
    ...plan.priority.examPriority,
    ...plan.priority.transfer,
    ...plan.priority.review,
  ]

  return candidates.length > 0 ? candidates[0] : null
}

/**
 * Berechne Progress Prozentanteil
 */
export function calculateExamProgress(plan: ExamReadinessPlan): number {
  const readyCount = plan.topics.filter(t => t.readiness === "READY").length
  const reviewCount = plan.topics.filter(t => t.readiness === "NEEDS_REVIEW").length

  const total = plan.topics.length
  if (total === 0) return 0

  // READY = 100%, NEEDS_REVIEW = 50%, rest = 0%
  const points = readyCount * 100 + reviewCount * 50
  return Math.round(points / (total * 100) * 100)
}
