/**
 * Mastery Engine
 * Tracks skill mastery levels (0-5) with spaced repetition
 * - Level 0: Not attempted
 * - Level 1: Attempted (with help)
 * - Level 2: Solved (with support)
 * - Level 3: Fluent (can do reliably)
 * - Level 4: Expert (teaches others)
 * - Level 5: Mastery (automaticity)
 */

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5

export interface SkillMastery {
  skill_id: string
  skill_name: string
  current_level: MasteryLevel
  attempts: number
  correct_attempts: number
  last_practiced: Date
  next_review: Date // Spaced repetition scheduling
  confidence: number // 0-1, confidence in current level
  time_spent_minutes: number
  error_patterns: string[] // Common mistakes
}

export interface MasteryUpdate {
  skill_id: string
  is_correct: boolean
  help_level_used: number // 0-5
  time_spent_seconds: number
  classification: string // A-F
}

/**
 * Calculate mastery level based on performance
 */
export function calculateMasteryLevel(
  currentLevel: MasteryLevel,
  isCorrect: boolean,
  helpLevelUsed: number,
  attemptCount: number
): MasteryLevel {
  // Level 5 (Mastery): Can't go higher
  if (currentLevel === 5) return 5

  // Correct without help → progress to next level
  if (isCorrect && helpLevelUsed === 0) {
    if (attemptCount === 1) {
      // First try correct = significant progress
      return Math.min(5, (currentLevel + 1) as MasteryLevel) as MasteryLevel
    } else if (attemptCount <= 2) {
      // Correct on 2nd try = normal progress
      return Math.min(5, (currentLevel + 1) as MasteryLevel) as MasteryLevel
    }
  }

  // Correct with minimal help → stay at level or small progress
  if (isCorrect && helpLevelUsed <= 1) {
    if (currentLevel >= 3) {
      return currentLevel // Expert level doesn't drop
    }
  }

  // Incorrect → drop 1 level or stay at 0
  if (!isCorrect) {
    return Math.max(0, (currentLevel - 1) as MasteryLevel) as MasteryLevel
  }

  // Default: maintain level
  return currentLevel
}

/**
 * Determine if mastery level should update
 * High-help attempts don't count toward mastery progression
 */
export function shouldUpdateMastery(
  isCorrect: boolean,
  helpLevelUsed: number,
  attemptCount: number
): boolean {
  // Only count attempts that show real understanding
  if (!isCorrect) return true // Track regressions

  // Level 4+ help = doesn't count toward progress
  if (helpLevelUsed >= 4) return false

  // Level 3 help = minimal progress
  if (helpLevelUsed === 3 && attemptCount > 2) return false

  return true
}

/**
 * Spaced Repetition: When should this skill be reviewed?
 * Uses Ebbinghaus Forgetting Curve
 */
export function calculateNextReview(
  masteryLevel: MasteryLevel,
  lastPracticed: Date,
  isCorrect: boolean
): Date {
  const now = new Date()
  let daysBetweenReviews: number

  if (!isCorrect) {
    // Failed: review tomorrow
    daysBetweenReviews = 1
  } else {
    // Success: spread reviews based on mastery
    switch (masteryLevel) {
      case 0:
      case 1:
        daysBetweenReviews = 1 // Daily
        break
      case 2:
        daysBetweenReviews = 2 // Every 2 days
        break
      case 3:
        daysBetweenReviews = 3 // Every 3 days (1 week series)
        break
      case 4:
        daysBetweenReviews = 7 // Weekly
        break
      case 5:
        daysBetweenReviews = 14 // Biweekly (maintenance only)
        break
      default:
        daysBetweenReviews = 1
    }
  }

  const nextReview = new Date(now)
  nextReview.setDate(nextReview.getDate() + daysBetweenReviews)
  return nextReview
}

/**
 * Get mastery description for Zoey
 */
export function getMasteryDescription(level: MasteryLevel): string {
  const descriptions = {
    0: "Noch nicht versucht 🤔",
    1: "Mit Hilfe gelöst 🤝",
    2: "Geschafft, aber mit Unterstützung 💪",
    3: "Fließend, kann es zuverlässig lösen ⭐",
    4: "Experte, kann es anderen erklären 🌟",
    5: "Meistery! Automatisch schnell & sicher 🏆",
  }

  return descriptions[level] || "Unbekannt"
}

/**
 * Confidence score: How sure are we about current mastery level?
 * Based on attempts and consistency
 */
export function calculateConfidence(
  attempts: number,
  correctAttempts: number,
  recentSuccessRate: number // Last 5 attempts
): number {
  if (attempts === 0) return 0

  const overallRate = correctAttempts / attempts
  const stabilityBonus = recentSuccessRate === 1.0 ? 0.1 : 0 // Consistency matters

  // Confidence grows with attempts, plateaus at higher levels
  const attemptConfidence = Math.min(1.0, attempts / 10)

  return Math.min(1.0, (overallRate + attemptConfidence + stabilityBonus) / 2)
}

/**
 * Track error patterns to identify misconceptions
 */
export function updateErrorPatterns(
  currentPatterns: string[],
  classification: string,
  newError?: string
): string[] {
  const patterns = [...currentPatterns]

  const errorMap: Record<string, string> = {
    B: "Careless mistake", // Small error
    C: "Procedural error", // Middle error
    D: "Conceptual gap", // Foundation gap
    E: "Misunderstood problem",
    F: "Uncertain recognition",
  }

  const errorType = errorMap[classification]
  if (errorType && !patterns.includes(errorType)) {
    patterns.push(errorType)

    // Keep only last 5 patterns
    if (patterns.length > 5) {
      patterns.shift()
    }
  }

  return patterns
}

/**
 * Mastery progress summary for learning dashboard
 */
export interface MasteryProgressSummary {
  total_skills: number
  mastered_count: number // Level 5
  expert_count: number // Level 4+
  fluent_count: number // Level 3+
  learning_count: number // Level 1-2
  not_started: number // Level 0
  average_mastery: number // 0-5
  progress_today: number // Skills improved today
  next_focus: string[] // Skills to practice today
}

export function calculateMasteryProgress(
  skills: SkillMastery[]
): MasteryProgressSummary {
  const now = new Date()

  return {
    total_skills: skills.length,
    mastered_count: skills.filter((s) => s.current_level === 5).length,
    expert_count: skills.filter((s) => s.current_level >= 4).length,
    fluent_count: skills.filter((s) => s.current_level >= 3).length,
    learning_count: skills.filter((s) => s.current_level >= 1 && s.current_level < 3).length,
    not_started: skills.filter((s) => s.current_level === 0).length,
    average_mastery: skills.reduce((sum, s) => sum + s.current_level, 0) / skills.length,
    progress_today: skills.filter((s) => {
      const practiced = new Date(s.last_practiced)
      return (
        practiced.toDateString() === now.toDateString() && s.current_level > 0
      )
    }).length,
    next_focus: skills
      .filter((s) => new Date(s.next_review) <= now)
      .sort((a, b) => {
        // Prioritize: lowest level, oldest review, most errors
        if (a.current_level !== b.current_level) {
          return a.current_level - b.current_level
        }
        return new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      })
      .slice(0, 3)
      .map((s) => s.skill_name),
  }
}
