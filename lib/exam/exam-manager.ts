/**
 * Phase 7A: Exam Manager
 * Klassenarbeit-Verwaltung und Orchestrierung
 */

import type { Exam, ExamTopic, ExamStatus, ExamTopicSourceType } from "@/lib/db/exam-schema"
import { GERMAN_GRADING_SCALE } from "@/lib/db/exam-schema"

/**
 * Erstelle neue Klassenarbeit
 */
export async function createExam(userId: string, input: {
  title: string
  examDate: Date  // JavaScript Date
  subject?: string
  description?: string
}): Promise<Exam> {
  const id = `exam_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

  // Convert Date to ISO 8601
  const examDateISO = input.examDate.toISOString().split("T")[0]

  // German format: DD.MM.YYYY
  const day = input.examDate.getDate().toString().padStart(2, "0")
  const month = (input.examDate.getMonth() + 1).toString().padStart(2, "0")
  const year = input.examDate.getFullYear()
  const examDateGerman = `${day}.${month}.${year}`

  const exam: Exam = {
    id,
    userId,
    title: input.title,
    subject: (input.subject || "mathematik") as "mathematik",
    examDate: examDateISO,
    examDateGerman,
    status: "PLANNING",
    description: input.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // TODO: In echte DB speichern
  console.log("[Exam Created]", exam)
  return exam
}

/**
 * Berechne Tage bis Klassenarbeit
 */
export function getDaysUntilExam(examDate: string): number {
  const exam = new Date(examDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)

  const diff = exam.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Format Datum auf Deutsch
 */
export function formatDateGerman(dateStr: string): string {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

/**
 * Parse Deutsch Datum
 */
export function parseDateGerman(dateStr: string): Date {
  const parts = dateStr.split(".")
  if (parts.length !== 3) throw new Error("Invalid German date format")

  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)

  return new Date(year, month, day)
}

/**
 * Calculate Readiness Status
 */
export type ReadinessStatus = "READY" | "NEEDS_REVIEW" | "NEEDS_PRACTICE" | "NOT_ASSESSED"

export function calculateReadiness(
  mastery: number,          // 0-100
  independentSuccessRate: number, // 0-100
  errorPatternCount: number,
  daysUntilExam: number
): ReadinessStatus {
  // READY: high mastery + independent success
  if (mastery >= 80 && independentSuccessRate >= 75) {
    return "READY"
  }

  // NEEDS_REVIEW: good mastery but occasional help needed
  if (mastery >= 65 && independentSuccessRate >= 60) {
    return "NEEDS_REVIEW"
  }

  // NEEDS_PRACTICE: below 65 mastery or recurring errors
  if (mastery < 65 || errorPatternCount > 0) {
    return "NEEDS_PRACTICE"
  }

  // NOT_ASSESSED: no data
  return "NOT_ASSESSED"
}

/**
 * Confidence Threshold
 * Bei Confidence < 0.7: ELI sollte fragen
 */
export const CONFIDENCE_THRESHOLD = 0.7

/**
 * Exam Status Flow
 */
export const EXAM_STATUS_FLOW: Record<ExamStatus, ExamStatus[]> = {
  "PLANNING": ["PREPARING", "COMPLETED"],
  "PREPARING": ["READY_FOR_SIMULATION", "COMPLETED"],
  "READY_FOR_SIMULATION": ["SIMULATION_COMPLETED", "COMPLETED"],
  "SIMULATION_COMPLETED": ["EXAM_TAKEN", "READY_FOR_SIMULATION"],
  "EXAM_TAKEN": ["RESULT_ANALYZED", "COMPLETED"],
  "RESULT_ANALYZED": ["COMPLETED"],
  "COMPLETED": [],
}

/**
 * Notenschlüssel: Deutsche Realschule
 */
export function getGermanGradeForPercentage(percentage: number): string | null {
  for (const [grade, range] of Object.entries(GERMAN_GRADING_SCALE)) {
    if (percentage >= range.min && percentage <= range.max) {
      return grade
    }
  }
  return null
}

/**
 * Sicherstellen: keine erfundene Noten
 */
export function shouldShowGrade(
  earnedPoints: number | undefined,
  totalPoints: number | undefined,
  gradingSchemeId: string | undefined,
  confidence: number
): boolean {
  // Nur anzeigen wenn:
  // 1. Punkte vorhanden
  // 2. Notenschlüssel bestätigt
  // 3. Confidence hoch genug
  return !!(
    earnedPoints !== undefined &&
    totalPoints !== undefined &&
    totalPoints > 0 &&
    gradingSchemeId &&
    confidence >= 0.8
  )
}

/**
 * Topic Priorität
 * - EXAM_PRIORITY: Direkt im Prüfungsstoff
 * - FOUNDATION: Mathematische Grundlage
 * - REVIEW: Sichere Themen nur kurz wiederholen
 */
export type ExamActivityPriority = "EXAM_PRIORITY" | "EXAM_WEAKNESS" | "EXAM_TRANSFER" | "EXAM_REVIEW" | "EXAM_SIMULATION_PREP"

/**
 * Exam Material Types
 */
export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  "WORKSHEET": "Arbeitsblatt",
  "CHEAT_SHEET": "Stoffzettel",
  "TEXTBOOK": "Schulbuch",
  "NOTEBOOK": "Hefteintrag",
  "OTHER": "Sonstiges",
}

/**
 * Validiere Exam Status Übergang
 */
export function canTransitionStatus(from: ExamStatus, to: ExamStatus): boolean {
  return EXAM_STATUS_FLOW[from]?.includes(to) ?? false
}

/**
 * English zu Deutsch für UI
 */
export const EXAM_STATUS_LABELS: Record<ExamStatus, string> = {
  "PLANNING": "Vorbereitung läuft",
  "PREPARING": "Material wird analysiert",
  "READY_FOR_SIMULATION": "Bereit für Probe",
  "SIMULATION_COMPLETED": "Probe erledigt",
  "EXAM_TAKEN": "Klassenarbeit geschrieben",
  "RESULT_ANALYZED": "Ergebnis ausgewertet",
  "COMPLETED": "Abgeschlossen",
}

/**
 * Topic Source Type zu Deutsch
 */
export const SOURCE_TYPE_LABELS: Record<ExamTopicSourceType, string> = {
  "CONFIRMED": "Im Stoff bestätigt",
  "LIKELY": "Wahrscheinlich",
  "FOUNDATION": "Grundlage nötig",
  "USER_CONFIRMED": "Von dir ergänzt",
}

/**
 * Readiness Status zu Deutsch + Emoji
 */
export const READINESS_STATUS_DISPLAY: Record<ReadinessStatus, { label: string; emoji: string; color: string }> = {
  "READY": { label: "Kann ich schon", emoji: "🟢", color: "green" },
  "NEEDS_REVIEW": { label: "Wird sicherer", emoji: "🟡", color: "yellow" },
  "NEEDS_PRACTICE": { label: "Das üben wir noch", emoji: "🟠", color: "orange" },
  "NOT_ASSESSED": { label: "Noch nicht geprüft", emoji: "⚪", color: "gray" },
}
