/**
 * Phase 9F: Closed Loop Integration
 * Feed exam feedback back to Phase 8 → modify next week's training
 */

import { getDatabase } from "@/lib/db/connection"
import { learningBaselines } from "@/lib/db/schema"

export interface ExamFeedback {
  adaptiveSignals: string[]
  foundationGapsToCheck: string[]
  transferGapTopics: string[]
  strategyAdjustments: string[]
}

/**
 * Apply exam feedback to Phase 8 baseline
 * This updates the adaptive engine's "starting point" for next week
 */
export async function applyExamFeedbackToBaseline(
  userId: string,
  feedback: ExamFeedback
): Promise<void> {
  const db = getDatabase()

  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Record that we detected these issues from real exam
  const metrics = {
    examFeedback: feedback,
    detectedTransferFailures: feedback.transferGapTopics,
    detectedFoundationGaps: feedback.foundationGapsToCheck,
    adaptiveSignals: feedback.adaptiveSignals,
    confidenceFromRealExam: 0.95,
    appliedAt: now.toISOString(),
  }

  await db.insert(learningBaselines).values({
    id: `baseline-${userId}-${Date.now()}`,
    userId,
    baselineStart: now.toISOString(),
    baselineEnd: weekFromNow.toISOString(),
    metrics: JSON.stringify(metrics),
  })

  console.log(`[Closed Loop] Baseline updated for ${userId}`)
}

/**
 * Replan next week based on exam feedback
 * Updates Phase 8 optimization signals; Phase 5/7 planner reads signals next cycle
 */
export async function replanWeekFromExamFeedback(
  userId: string,
  feedback: ExamFeedback
): Promise<void> {
  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const metrics = {
    replanning: true,
    appliedAt: now.toISOString(),
    foundationChecksDays: [0, 1],
    transferTasksDays: [2, 3, 4],
    topicsToCheck: feedback.foundationGapsToCheck,
    transferGapTopics: feedback.transferGapTopics,
    nextWeekSignals: [
      ...feedback.adaptiveSignals,
      "REPLAN_ACTIVE",
    ],
  }

  const db = getDatabase()
  await db.insert(learningBaselines).values({
    id: `baseline-${userId}-replan-${Date.now()}`,
    userId,
    baselineStart: now.toISOString(),
    baselineEnd: weekFromNow.toISOString(),
    metrics: JSON.stringify(metrics),
  })

  console.log(`[Closed Loop] Replan metadata saved for ${userId}`)
}

/**
 * Generate Phase 8 optimization directive
 * Tells Phase 8 exactly what to prioritize
 */
export function generatePhase8OptimizationDirective(feedback: ExamFeedback): {
  priorityFocuses: string[]
  strategyPreferences: string[]
  difficultyAdjustment: string
  reviewSchedule: string
} {
  return {
    priorityFocuses: [
      ...feedback.transferGapTopics.map((t) => `TRANSFER_FOCUS:${t}`),
      ...feedback.foundationGapsToCheck.map((f) => `FOUNDATION_REVIEW:${f}`),
    ],

    strategyPreferences: [
      feedback.adaptiveSignals.includes("TRANSFER_FAILURE")
        ? "BRIDGE_TASK,WORKED_EXAMPLE,CONCRETE_EXAMPLE"
        : "STEP_BY_STEP,VISUAL_REPRESENTATION",
      "Reduce SIMPLE_TEXT, increase real-world examples",
    ],

    difficultyAdjustment:
      feedback.adaptiveSignals.includes("REPEATED_ERROR_PATTERN")
        ? "DECREASE_BY_2_LEVELS"
        : "MAINTAIN",

    reviewSchedule: "SPACED_REPETITION_AGGRESSIVE:2-3-5-day pattern",
  }
}
