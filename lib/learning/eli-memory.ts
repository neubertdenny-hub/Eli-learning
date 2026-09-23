/**
 * Eli Memory Engine
 * Maintains contextual memory of Zoey's learning journey
 * - Learning style preferences
 * - Favorite topics and struggling areas
 * - Personal milestones and celebrations
 * - Long-term learning patterns
 */

export interface LearningProfile {
  student_name: string // "Zoey"
  favorite_topics: string[] // Top 3 engaged topics
  struggling_areas: string[] // Areas needing help
  learning_speed: "quick" | "steady" | "gradual" // How fast they progress
  preferred_help_level: number // 0-5, what level they like
  total_practice_hours: number
  session_count: number
  current_streak_days: number
  longest_streak_days: number
  first_mastery_date?: Date // When first skill reached level 5
}

export interface ConversationMemory {
  student_name: string
  recent_achievements: string[] // Last 5 victories
  recent_struggles: string[] // Last 3 failures
  learning_personality: string // Quirky facts about their learning
  jokes_or_interests: string[] // Things that made them laugh/interested
  mentor_tips: string[] // What works well for this student
}

export interface EliContextual {
  // Current session state
  session_start: Date
  session_topics_covered: string[]
  problems_solved_today: number
  mistakes_today: number
  current_mood: "energized" | "focused" | "tired" | "frustrated" | "celebrating"

  // Memory snippets
  last_achievement: string
  last_struggle: string
  encouraging_phrase: string // Personalized motivation
  celebration_ready: boolean // Has they earned a celebration today?
}

/**
 * Build Eli's personality-based messages from memory
 */
export function createPersonalizedMessage(
  memory: ConversationMemory,
  context: "greeting" | "encouragement" | "celebration" | "hint"
): string {
  const { student_name, learning_personality, recent_achievements } = memory

  switch (context) {
    case "greeting":
      return `Hallo ${student_name}! 👋 Bereit, heute wieder was zu lernen? Du machst das so gut!`

    case "encouragement":
      if (memory.recent_struggles.length > 0) {
        return `${student_name}, das ist eine knifflige Aufgabe - genau wie die letzte! Aber du schaffst es! 💪`
      }
      return `Du bist auf Feuer heute, ${student_name}! 🔥`

    case "celebration":
      return `🎉 ${student_name}! Du hast es GENAU richtig gemacht! Das ist dein ${recent_achievements.length}. Erfolg! 🏆`

    case "hint":
      return `Denk dran, ${student_name}: ${learning_personality || "Du kannst das!"}`

    default:
      return `Lass uns weitermachen, ${student_name}!`
  }
}

/**
 * Track learning personality traits
 * Build profile of how Zoey learns best
 */
export interface LearningPersonality {
  is_visual_learner: number // 0-1, shows diagrams/shapes help
  is_verbal_learner: number // 0-1, responds to explanations
  is_kinesthetic: number // 0-1, learns by doing (many attempts)
  prefers_challenge: number // 0-1, likes harder problems vs easy wins
  social_learner: number // 0-1, mentions teamwork/explaining others
  perfectionist: boolean // Gets frustrated with small errors?
  quick_to_celebrate: boolean // Energized by wins?
  independent: number // 0-1, how much help-seeking
}

/**
 * Detect learning personality from behavior
 */
export function detectLearningPersonality(
  sessionData: {
    diagram_interactions: number
    explanation_requests: number
    attempt_count: number
    problem_difficulty_increases: number
    mentions_peers: number
    error_reactions: string[]
    celebration_engagement: string[]
  }
): Partial<LearningPersonality> {
  return {
    is_visual_learner: sessionData.diagram_interactions > 5 ? 0.8 : 0.3,
    is_verbal_learner: sessionData.explanation_requests > 3 ? 0.7 : 0.2,
    is_kinesthetic:
      sessionData.attempt_count > 5 && !sessionData.error_reactions.includes("frustrated")
        ? 0.8
        : 0.3,
    prefers_challenge:
      sessionData.problem_difficulty_increases > 3
        ? 0.7
        : sessionData.problem_difficulty_increases === 0
          ? 0.2
          : 0.5,
    social_learner: sessionData.mentions_peers > 2 ? 0.8 : 0.1,
    perfectionist: sessionData.error_reactions.includes("frustrated") ? true : false,
    quick_to_celebrate: sessionData.celebration_engagement.length > 2 ? true : false,
    independent: 1 - Math.min(1, sessionData.explanation_requests / 10),
  }
}

/**
 * Generate Eli's contextual knowledge for Zoey
 * What does Eli "know" about this student from memory?
 */
export function generateEliContext(profile: LearningProfile): string {
  const contextClues: string[] = []

  if (profile.favorite_topics.length > 0) {
    contextClues.push(
      `${profile.student_name} liebt ${profile.favorite_topics[0]}! 🎯`
    )
  }

  if (profile.struggling_areas.length > 0) {
    contextClues.push(
      `${profile.struggling_areas[0]} ist noch knifflig für ${profile.student_name}.`
    )
  }

  if (profile.current_streak_days >= 7) {
    contextClues.push(
      `${profile.current_streak_days}-Tage-Streak! 🔥 ${profile.student_name} ist konsistent!`
    )
  }

  if (profile.learning_speed === "quick") {
    contextClues.push(`${profile.student_name} lernt schnell - braucht oft Herausforderung!`)
  } else if (profile.learning_speed === "gradual") {
    contextClues.push(`${profile.student_name} braucht Zeit zu verstehen - das ist ok! 🌱`)
  }

  return contextClues.join(" ")
}

/**
 * Should Eli celebrate today?
 * Tracks daily celebrations to avoid over-celebrating
 */
export function shouldCelebrate(
  achievementsToday: number,
  milestoneReached: boolean
): boolean {
  // Celebrate milestones (first mastery, 10 correct, streak records)
  if (milestoneReached) return true

  // Celebrate every 3rd correct answer max (avoid decision fatigue)
  if (achievementsToday >= 3 && achievementsToday % 3 === 0) return true

  return false
}

/**
 * Build encouraging phrase library tailored to student
 */
export function getEncouragingPhrase(
  context: "trying_hard" | "improvement" | "breakthrough" | "consistency" | "challenge"
): string {
  const phrases = {
    trying_hard: [
      "Du gibst dein Bestes - das ist wichtig! 💪",
      "Nicht perfekt ist ok - Versuch zählt! ✨",
      "Ich sehe dass du hart arbeitest! 🎯",
    ],
    improvement: [
      "Wow, du wirst besser! 📈",
      "Das war letzte Woche schwer - jetzt geht es! 🚀",
      "Fortschritt! Du machst Fortschritte! 🌟",
    ],
    breakthrough: [
      "🎉 EUREKA! Du hast es verstanden!",
      "Moment mal - genau! Das ist der Trick! 💡",
      "Boom! 💥 Du hast es geknackt!",
    ],
    consistency: [
      "Tag 7 Streak! Deine Konsistenz ist beeindruckend! 🔥",
      "Du bist nicht aufgegeben - das macht dich zum Champion! 🏆",
      "Jeden Tag ein Bisschen besser! 📚",
    ],
    challenge: [
      "Das ist schwer - aber du magst Herausforderungen! 💪",
      "Level-up! Das ist jetzt für dich kein Kinderkram! 🎮",
      "Schwierig? Perfekt - du wächst! 🌱",
    ],
  }

  const chosen = phrases[context]
  return chosen[Math.floor(Math.random() * chosen.length)]
}

/**
 * Export Eli's understanding of Zoey
 * Used in reports and parent communication
 */
export interface EliReport {
  student_name: string
  date_generated: Date
  learning_summary: string
  strengths: string[]
  growth_areas: string[]
  personalized_recommendations: string[]
  celebrate_wins: string[]
}

export function generateEliReport(
  profile: LearningProfile,
  memory: ConversationMemory,
  achievements: string[]
): EliReport {
  return {
    student_name: profile.student_name,
    date_generated: new Date(),
    learning_summary: `${profile.student_name} has completed ${profile.session_count} learning sessions over ${profile.total_practice_hours} hours. Current streak: ${profile.current_streak_days} days.`,
    strengths: profile.favorite_topics,
    growth_areas: profile.struggling_areas,
    personalized_recommendations: [
      `Spaced repetition schedule for ${profile.struggling_areas[0] || "new topics"}`,
      `More ${profile.favorite_topics[0]} challenges to maintain engagement`,
      `Celebrate small wins more often - keeps motivation high!`,
    ],
    celebrate_wins: memory.recent_achievements,
  }
}
