/**
 * Learning Session Manager
 * Orchestrates complete learning flow:
 * Classification → Mastery Update → Memory Recording → Spaced Repetition
 */

import { AnswerClassification } from "@/lib/ai/schemas"
import {
  MasteryLevel,
  SkillMastery,
  calculateMasteryLevel,
  shouldUpdateMastery,
  calculateNextReview,
  updateErrorPatterns,
  calculateConfidence,
} from "./mastery-engine"
import { LearningProfile, ConversationMemory, getEncouragingPhrase } from "./eli-memory"

export interface SessionResponse {
  classification: AnswerClassification
  is_correct: boolean
  mastery_before: MasteryLevel
  mastery_after: MasteryLevel
  mastery_progressed: boolean
  next_review: Date
  confidence: number
  eli_message: string
  memory_recorded: boolean
  spaced_repetition_updated: boolean
}

/**
 * Process complete learning session
 * Input: Answer Classification
 * Output: Mastery update + Memory recording + Scheduled review
 */
export async function processLearningSession(
  skillMastery: SkillMastery,
  classification: AnswerClassification,
  helpLevelUsed: number,
  timeSpent: number,
  learnerProfile: LearningProfile,
  learnerMemory: ConversationMemory
): Promise<SessionResponse> {
  const isCorrect = classification === "A" || classification === "B"
  const attemptCount = skillMastery.attempts + 1

  // 1. CALCULATE MASTERY PROGRESSION
  const masteryBefore = skillMastery.current_level
  const shouldUpdate = shouldUpdateMastery(isCorrect, helpLevelUsed, attemptCount)

  let masteryAfter = masteryBefore
  if (shouldUpdate) {
    masteryAfter = calculateMasteryLevel(
      masteryBefore,
      isCorrect,
      helpLevelUsed,
      attemptCount
    )
  }

  const masteryProgressed = masteryAfter > masteryBefore

  // 2. CALCULATE NEXT REVIEW DATE (Spaced Repetition)
  const nextReview = calculateNextReview(
    masteryAfter,
    skillMastery.last_practiced,
    isCorrect
  )

  // 3. UPDATE CONFIDENCE
  const correctAttempts = isCorrect ? skillMastery.correct_attempts + 1 : skillMastery.correct_attempts
  const recentSuccessRate = calculateRecentSuccess(skillMastery.correct_attempts, attemptCount)
  const confidence = calculateConfidence(attemptCount, correctAttempts, recentSuccessRate)

  // 4. TRACK ERROR PATTERNS
  const errorPatterns = updateErrorPatterns(
    skillMastery.error_patterns,
    classification
  )

  // 5. GENERATE ELI MESSAGE
  const eliMessage = generateSessionMessage(
    learnerProfile.student_name || "Zoey",
    classification,
    masteryAfter,
    masteryProgressed,
    attemptCount,
    learnerMemory
  )

  // 6. UPDATE SKILL MASTERY
  const updatedMastery: SkillMastery = {
    ...skillMastery,
    current_level: masteryAfter,
    attempts: attemptCount,
    correct_attempts: correctAttempts,
    last_practiced: new Date(),
    next_review: nextReview,
    confidence,
    time_spent_minutes: skillMastery.time_spent_minutes + timeSpent / 60,
    error_patterns: errorPatterns,
  }

  // 7. RECORD IN MEMORY (Eli remembers this moment!)
  recordInMemory(learnerMemory, classification, skillMastery.skill_name, masteryAfter)

  return {
    classification,
    is_correct: isCorrect,
    mastery_before: masteryBefore,
    mastery_after: masteryAfter,
    mastery_progressed: masteryProgressed,
    next_review: nextReview,
    confidence,
    eli_message: eliMessage,
    memory_recorded: true,
    spaced_repetition_updated: true,
  }
}

/**
 * Generate Eli's response based on complete session context
 */
function generateSessionMessage(
  studentName: string,
  classification: AnswerClassification,
  masteryAfter: MasteryLevel,
  masteryProgressed: boolean,
  attemptCount: number,
  memory: ConversationMemory
): string {
  // Mastery breakthroughs get special celebration
  if (masteryProgressed && masteryAfter >= 3) {
    const celebrations = [
      `🎉 ${studentName}! Du hast ${masteryAfter === 5 ? "MEISTERY" : "ein neues Level"} erreicht!`,
      `⭐ Wow! Dein ${masteryAfter}. Level in dieser Fähigkeit! Das ist Fortschritt!`,
      `🚀 ${studentName}, du bist jetzt ${masteryAfter === 5 ? "ein Meister" : "viel besser"}!`,
    ]
    return celebrations[Math.floor(Math.random() * celebrations.length)]
  }

  // Classification-based responses
  switch (classification) {
    case "A":
      return attemptCount === 1
        ? `✅ Perfekt beim ersten Versuch! Du bist der Beste, ${studentName}! 🌟`
        : `✅ Genau richtig! Du wirst besser, ${studentName}! 📈`

    case "B":
      return `💡 Sehr nah dran! Du schaffst das! Versuch es nochmal, ${studentName}! 💪`

    case "C":
      return attemptCount > 2
        ? `📝 Okay, lass mich dir Schritt für Schritt zeigen, ${studentName}! 👇`
        : `🤔 Ein Schritt passt nicht. Welcher könnte es sein, ${studentName}?`

    case "D":
      return `🌉 Das ist eine Grundlage die wir verstärken müssen! Wir machen es Schritt für Schritt. 🛤️`

    case "E":
      return `📚 Lass mich die Aufgabe anders erklären, ${studentName}. Verstanden?`

    case "F":
      return `🤔 Moment - ich bin mir nicht ganz sicher. Kannst du das nochmal überprüfen, ${studentName}?`

    default:
      return `Lass uns weitermachen, ${studentName}! 💪`
  }
}

/**
 * Record session outcome in Eli's memory
 */
function recordInMemory(
  memory: ConversationMemory,
  classification: AnswerClassification,
  skillName: string,
  masteryLevel: MasteryLevel
): void {
  // Record recent achievements
  if (classification === "A") {
    memory.recent_achievements.push(`"${skillName}" gelöst! (Level ${masteryLevel})`)
    if (memory.recent_achievements.length > 5) {
      memory.recent_achievements.shift()
    }
  }

  // Record recent struggles
  if (classification === "D" || classification === "E") {
    memory.recent_struggles.push(`"${skillName}" braucht mehr Übung`)
    if (memory.recent_struggles.length > 3) {
      memory.recent_struggles.shift()
    }
  }

  // Update learning personality notes
  if (masteryLevel >= 4 && !memory.learning_personality.includes("quick learner")) {
    memory.learning_personality = "schnell lernend und motiviert! 🚀"
  }

  if (memory.recent_struggles.length > 2) {
    memory.learning_personality = "arbeitet hart an Herausforderungen! 💪"
  }
}

/**
 * Calculate recent success rate (last 5 attempts)
 */
function calculateRecentSuccess(correctAttempts: number, totalAttempts: number): number {
  if (totalAttempts === 0) return 0
  if (totalAttempts <= 5) {
    return correctAttempts / totalAttempts
  }
  // Approximate: assume recent attempts have same success rate
  return correctAttempts / totalAttempts
}

/**
 * Get skills due for spaced repetition today
 */
export function getSkillsDueForReview(skills: SkillMastery[]): SkillMastery[] {
  const now = new Date()
  return skills.filter((skill) => new Date(skill.next_review) <= now)
}

/**
 * Recommend next skill based on spaced repetition + engagement
 */
export function recommendNextSkill(
  allSkills: SkillMastery[],
  favoriteTopics: string[]
): SkillMastery | null {
  const skillsDue = getSkillsDueForReview(allSkills)

  if (skillsDue.length === 0) {
    // No skills due: suggest from favorites
    const favoriteSkills = allSkills.filter((s) =>
      favoriteTopics.some((topic) => s.skill_name.includes(topic))
    )
    return favoriteSkills[Math.floor(Math.random() * favoriteSkills.length)] || null
  }

  // Prioritize lowest mastery level among due skills
  return skillsDue.reduce((lowest, current) =>
    current.current_level < lowest.current_level ? current : lowest
  )
}

/**
 * Session streak tracking for motivation
 */
export interface StreakData {
  current_streak: number
  longest_streak: number
  last_session_date: Date
  sessions_this_week: number
  sessions_this_month: number
}

export function updateStreak(
  current: StreakData,
  sessionDate: Date
): StreakData {
  const yesterday = new Date(sessionDate)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if session continues the streak
  const continuesStreak = current.last_session_date &&
    current.last_session_date.toDateString() === yesterday.toDateString()

  return {
    current_streak: continuesStreak ? current.current_streak + 1 : 1,
    longest_streak: Math.max(
      current.longest_streak,
      continuesStreak ? current.current_streak + 1 : 1
    ),
    last_session_date: sessionDate,
    sessions_this_week: getSessionsThisWeek(current.last_session_date, sessionDate),
    sessions_this_month: getSessionsThisMonth(current.last_session_date, sessionDate),
  }
}

function getSessionsThisWeek(lastSession: Date, today: Date): number {
  const daysAgo = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24))
  return daysAgo <= 7 ? 1 : 0 // Simplified
}

function getSessionsThisMonth(lastSession: Date, today: Date): number {
  const daysAgo = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24))
  return daysAgo <= 30 ? 1 : 0 // Simplified
}
