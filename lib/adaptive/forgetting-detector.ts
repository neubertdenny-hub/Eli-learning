/**
 * Phase 8E: Forgetting Detection & Retention
 * Distinguishes between never-mastered, forgotten, and temporary errors
 */

import { getDatabase } from "@/lib/db/connection"
import { skillMastery } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type ForgettingType = "NEVER_MASTERED" | "POSSIBLE_FORGETTING" | "TEMPORARY_ERROR"

export interface ForgettingAnalysis {
  type: ForgettingType
  confidence: number
  lastMasteredAt?: Date
  daysSinceMastery?: number
  evidence: string[]
  recommendedAction: "RELEARN" | "QUICK_REVIEW" | "CONTINUE"
}

/**
 * Analyze if current error represents forgetting vs never learning
 */
export async function analyzeForgetting(
  userId: string,
  topic: string,
  currentError: boolean,
  recentHistory: Array<{ date: Date; correct: boolean }>,
  masteryHistory: { level: number; lastPracticed: Date; confidence: number }
): Promise<ForgettingAnalysis> {
  const evidence: string[] = []

  // Check 1: Has this ever been mastered?
  if (masteryHistory.level < 2) {
    evidence.push("Topic never reached mastery (level < 2)")
    return {
      type: "NEVER_MASTERED",
      confidence: 0.9,
      evidence,
      recommendedAction: "RELEARN",
    }
  }

  evidence.push(`Topic previously mastered at level ${masteryHistory.level}`)

  // Check 2: Time since last practice
  const now = new Date()
  const daysSinceLastPractice = Math.floor(
    (now.getTime() - masteryHistory.lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
  )
  evidence.push(`${daysSinceLastPractice} days since last practice`)

  // Check 3: Recent success rate before error
  const last5 = recentHistory.slice(-5)
  const recentSuccesses = last5.filter((h) => h.correct).length
  evidence.push(`Recent success rate: ${recentSuccesses}/5`)

  // Decision logic
  if (daysSinceLastPractice > 14) {
    // More than 2 weeks
    if (recentSuccesses >= 3) {
      // But was doing well recently
      return {
        type: "TEMPORARY_ERROR",
        confidence: 0.7,
        lastMasteredAt: masteryHistory.lastPracticed,
        daysSinceMastery: daysSinceLastPractice,
        evidence,
        recommendedAction: "CONTINUE",
      }
    }

    return {
      type: "POSSIBLE_FORGETTING",
      confidence: 0.85,
      lastMasteredAt: masteryHistory.lastPracticed,
      daysSinceMastery: daysSinceLastPractice,
      evidence,
      recommendedAction: "QUICK_REVIEW",
    }
  }

  if (daysSinceLastPractice > 7 && recentSuccesses <= 2) {
    return {
      type: "POSSIBLE_FORGETTING",
      confidence: 0.75,
      lastMasteredAt: masteryHistory.lastPracticed,
      daysSinceMastery: daysSinceLastPractice,
      evidence,
      recommendedAction: "QUICK_REVIEW",
    }
  }

  // Recent practice = probably temporary error
  return {
    type: "TEMPORARY_ERROR",
    confidence: 0.8,
    lastMasteredAt: masteryHistory.lastPracticed,
    daysSinceMastery: daysSinceLastPractice,
    evidence,
    recommendedAction: "CONTINUE",
  }
}

/**
 * Quick review: 2-3 tasks to check if knowledge is retained
 */
export function createQuickReview(topic: string, difficulty: number): {
  reviewTasks: number
  difficulty: number
  passThreshold: number // Must solve X/Y to pass
} {
  return {
    reviewTasks: 3,
    difficulty: Math.max(1, difficulty - 1), // Slightly easier
    passThreshold: 2, // Must get 2/3 correct
  }
}

/**
 * After quick review: decide next action
 */
export function decideReviewOutcome(
  passed: boolean,
  correctCount: number,
  totalCount: number
): {
  masteryRetained: boolean
  nextAction: "CONTINUE_ORIGINAL" | "RELEARN" | "EXTEND_PRACTICE"
  masteryScoreAdjustment: number
} {
  if (passed || correctCount === totalCount) {
    return {
      masteryRetained: true,
      nextAction: "CONTINUE_ORIGINAL",
      masteryScoreAdjustment: 0, // Keep current mastery
    }
  }

  if (correctCount >= 1) {
    return {
      masteryRetained: true,
      nextAction: "EXTEND_PRACTICE",
      masteryScoreAdjustment: -0.15, // Slight decrease
    }
  }

  return {
    masteryRetained: false,
    nextAction: "RELEARN",
    masteryScoreAdjustment: -0.4, // Significant decrease
  }
}

/**
 * Update review schedule based on retention
 */
export async function updateReviewSchedule(
  userId: string,
  topic: string,
  retentionSuccess: boolean
): Promise<Date> {
  const db = getDatabase()
  const now = new Date()

  // Find next review date
  let nextReviewDate: Date

  if (retentionSuccess) {
    // Spread out: if was 7 days, try 14 days
    nextReviewDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  } else {
    // More frequent: bring forward
    nextReviewDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  }

  try {
    // Update the skill mastery next review date
    const mastery = await db
      .select()
      .from(skillMastery)
      .where(eq(skillMastery.skillName, topic))
      .limit(1)

    if (mastery.length > 0) {
      // Update would go here - for now just return calculated date
    }
  } catch (error) {
    console.error("[Failed to update review schedule]", error)
  }

  return nextReviewDate
}

/**
 * Calculate decay score: how much mastery has eroded over time
 */
export function calculateDecayScore(
  daysSincePractice: number,
  masteryLevel: number,
  recentSuccessRate: number
): number {
  // Base decay from time
  const timeDecay = Math.min(0.5, daysSincePractice / 30) // Max 50% decay at 30 days

  // Adjust for mastery level (higher mastery decays slower)
  const masteryFactor = 1 - masteryLevel * 0.1 // Level 5 = 50% slower decay

  // Boost from recent success
  const successBoost = recentSuccessRate * 0.3

  const totalDecay = timeDecay * masteryFactor - successBoost
  return Math.max(0, Math.min(1, totalDecay))
}

/**
 * Message for review/retention actions
 */
export function getForgettingMessage(type: ForgettingType): string {
  switch (type) {
    case "NEVER_MASTERED":
      return "Das brauchen wir noch üben. Lass mich dir dabei helfen! 💪"
    case "POSSIBLE_FORGETTING":
      return "Das hattest du schon mal. Lass mich dich schnell testen. ⏱️"
    case "TEMPORARY_ERROR":
      return "Einfach Pech. Versuch es gleich nochmal! 🎯"
  }
}
