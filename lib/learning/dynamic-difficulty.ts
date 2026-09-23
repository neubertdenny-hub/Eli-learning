/**
 * Dynamic Difficulty Engine
 * Adapts problem difficulty in real-time based on Zoey's performance
 * - Maintains "flow" zone (not too easy, not too hard)
 * - Detects when student is frustrated or bored
 * - Adjusts gradually (never huge jumps)
 */

export type PerformanceLevel = "crushing_it" | "confident" | "challenged" | "struggling" | "overwhelmed"

export interface DifficultyState {
  current_difficulty: number // 1-5
  recommended_difficulty: number
  performance_trend: PerformanceLevel
  correct_streak: number
  error_streak: number
  total_attempts: number
  average_attempts_per_problem: number
  time_efficiency: number // 0-1, how fast they solve
  frustration_signals: number // Count of struggle indicators
  boredom_signals: number // Count of easy/fast completions
}

/**
 * Analyze performance to detect current difficulty zone
 */
export function analyzeDifficultyPerformance(history: {
  classifications: string[] // Last 5 attempts: A/B/C/D/E/F
  helpLevels: number[] // Last 5 help levels
  timePerProblem: number[] // Seconds per problem
  attemptCounts: number[] // Attempts per problem
}): DifficultyState {
  const classifications = history.classifications.slice(-5)
  const helpLevels = history.helpLevels.slice(-5)
  const times = history.timePerProblem.slice(-5)
  const attempts = history.attemptCounts.slice(-5)

  // Calculate correct streak
  let correctStreak = 0
  for (let i = classifications.length - 1; i >= 0; i--) {
    if (classifications[i] === "A" || classifications[i] === "B") {
      correctStreak++
    } else {
      break
    }
  }

  // Calculate error streak
  let errorStreak = 0
  for (let i = classifications.length - 1; i >= 0; i--) {
    if (classifications[i] === "C" || classifications[i] === "D" || classifications[i] === "E") {
      errorStreak++
    } else {
      break
    }
  }

  // Performance metrics
  const avgAttempts = attempts.length > 0 ? attempts.reduce((a, b) => a + b, 0) / attempts.length : 1
  const avgHelpUsed = helpLevels.length > 0 ? helpLevels.reduce((a, b) => a + b, 0) / helpLevels.length : 0
  const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  const timeEfficiency = avgTime > 0 ? Math.min(1, 180 / avgTime) : 0.5 // Fast if under 3 min

  // Detect frustration signals
  let frustrationSignals = 0
  if (classifications.includes("D") || classifications.includes("E")) frustrationSignals++
  if (errorStreak >= 3) frustrationSignals++
  if (avgAttempts > 3) frustrationSignals++
  if (avgHelpUsed > 3) frustrationSignals++

  // Detect boredom signals
  let boredomSignals = 0
  if (correctStreak >= 3 && classifications.every((c) => c === "A")) boredomSignals++ // Too many perfect scores
  if (timeEfficiency > 0.9 && classifications.every((c) => c === "A")) boredomSignals++ // Very fast + perfect
  if (avgAttempts < 1.2) boredomSignals++ // Very easy

  // Determine performance level
  let performanceLevel: PerformanceLevel
  if (frustrationSignals >= 3) {
    performanceLevel = "overwhelmed"
  } else if (frustrationSignals >= 2) {
    performanceLevel = "struggling"
  } else if (boredomSignals >= 2) {
    performanceLevel = "crushing_it"
  } else if (correctStreak >= 2 && avgAttempts <= 1.5) {
    performanceLevel = "confident"
  } else {
    performanceLevel = "challenged"
  }

  // Estimate current difficulty
  const baseDifficulty = 3 // Start at medium
  let currentDifficulty = baseDifficulty

  // Adjust based on performance
  if (correctStreak >= 3) currentDifficulty += 1
  if (errorStreak >= 2) currentDifficulty -= 1
  if (avgHelpUsed > 3) currentDifficulty -= 1

  currentDifficulty = Math.max(1, Math.min(5, currentDifficulty))

  return {
    current_difficulty: currentDifficulty,
    recommended_difficulty: recommendNextDifficulty(performanceLevel, currentDifficulty),
    performance_trend: performanceLevel,
    correct_streak: correctStreak,
    error_streak: errorStreak,
    total_attempts: classifications.length,
    average_attempts_per_problem: avgAttempts,
    time_efficiency: timeEfficiency,
    frustration_signals: frustrationSignals,
    boredom_signals: boredomSignals,
  }
}

/**
 * Recommend next difficulty based on performance trend
 * Changes slowly to avoid jarring jumps
 */
function recommendNextDifficulty(
  performance: PerformanceLevel,
  current: number
): number {
  switch (performance) {
    case "crushing_it":
      return Math.min(5, current + 1) // Increase by 1
    case "confident":
      return Math.min(5, current + 1) // Can try harder
    case "challenged":
      return current // Stay in flow zone
    case "struggling":
      return Math.max(1, current - 1) // Make easier
    case "overwhelmed":
      return Math.max(1, current - 2) // Make much easier
    default:
      return current
  }
}

/**
 * Get personalized difficulty message for Zoey
 */
export function getDifficultyMessage(state: DifficultyState): string {
  const messages: Record<PerformanceLevel, string> = {
    crushing_it: `🔥 Du bist auf Feuer! Lass mich die Aufgaben schwerer machen! 📈`,
    confident: `⭐ Du machst das gut! Bereit für eine kleine Herausforderung?`,
    challenged: `🎯 Genau richtig - die Aufgaben sind auf dein Level abgestimmt!`,
    struggling: `💪 Das ist schwer gerade - ich mache die nächsten leichter!`,
    overwhelmed: `🌱 Lass mich die Schwierigkeit runterfahren - wir bauen dein Selbstvertrauen auf!`,
  }

  return messages[state.performance_trend]
}

/**
 * Adjust problem based on performance
 * Concrete changes: difficulty number, estimated time, help availability
 */
export function generateAdaptiveProblem(
  baseProblem: {
    difficulty: number
    estimated_time_seconds: number
    allow_hints: boolean
  },
  performanceState: DifficultyState
): {
  difficulty: number
  estimated_time_seconds: number
  allow_hints: boolean
  hint_level_max: number // Max help level allowed (0-5)
} {
  const adapted = { ...baseProblem, hint_level_max: 5 }

  // Adjust difficulty
  if (performanceState.recommended_difficulty !== baseProblem.difficulty) {
    adapted.difficulty = performanceState.recommended_difficulty
  }

  // Adjust time expectations
  if (performanceState.performance_trend === "crushing_it") {
    adapted.estimated_time_seconds = Math.floor(baseProblem.estimated_time_seconds * 0.8) // Expect faster
  } else if (performanceState.performance_trend === "overwhelmed") {
    adapted.estimated_time_seconds = Math.floor(baseProblem.estimated_time_seconds * 1.3) // Give more time
  }

  // Restrict help for struggling students (force more independent problem-solving after help)
  if (performanceState.performance_trend === "overwhelmed") {
    adapted.hint_level_max = 3 // Max step-by-step help, no complete walkthrough
  } else if (performanceState.performance_trend === "struggling") {
    adapted.hint_level_max = 4 // Allow hints but not complete answers
  }

  return adapted
}

/**
 * Detect when to trigger a "confidence boost" break
 * Give easier problem to rebuild confidence when struggling
 */
export function shouldTriggerConfidenceBoost(state: DifficultyState): boolean {
  // After 2+ frustration signals, give a confidence boost
  if (state.frustration_signals >= 2 && state.performance_trend !== "challenged") {
    return true
  }

  // If error streak is long, boost confidence
  if (state.error_streak >= 3) {
    return true
  }

  return false
}

/**
 * Generate confidence-boosting problem (guaranteed success)
 * Pull from mastered skills (Level 4-5)
 */
export function generateConfidenceBoostProblem(masteredSkills: any[]): any {
  if (masteredSkills.length === 0) return null

  const skill = masteredSkills[Math.floor(Math.random() * masteredSkills.length)]

  return {
    skill_id: skill.skill_id,
    skill_name: skill.skill_name,
    difficulty: Math.max(1, skill.current_level - 2), // Much easier than their mastery
    message: `🌟 Lass mich dir einen Sieg geben! Das kannst du mühelos! 💪`,
  }
}

/**
 * Flow State Detection
 * Optimal learning happens in "flow zone"
 * - Not too easy (no boredom)
 * - Not too hard (no frustration)
 * - Immediate feedback (our system provides this)
 * - Clear goals (each task has goal)
 */
export function isInFlowState(state: DifficultyState): boolean {
  const inFlowZone =
    state.performance_trend === "challenged" || state.performance_trend === "confident"

  return inFlowZone
}

/**
 * Difficulty progression timeline
 * Shows student their challenge journey
 */
export interface DifficultyTimeline {
  session_start_difficulty: number
  session_current_difficulty: number
  max_difficulty_reached: number
  difficulty_progression: Array<{
    task_number: number
    difficulty: number
    performance: PerformanceLevel
  }>
  in_flow_state_percentage: number // % of time in optimal zone
}

export function buildDifficultyTimeline(
  history: DifficultyState[]
): DifficultyTimeline {
  const flowStates = history.filter((s) => isInFlowState(s)).length
  const inFlowPercentage = (flowStates / history.length) * 100

  return {
    session_start_difficulty: history[0]?.current_difficulty || 3,
    session_current_difficulty: history[history.length - 1]?.current_difficulty || 3,
    max_difficulty_reached: Math.max(...history.map((s) => s.current_difficulty)),
    difficulty_progression: history.map((s, i) => ({
      task_number: i + 1,
      difficulty: s.current_difficulty,
      performance: s.performance_trend,
    })),
    in_flow_state_percentage: Math.round(inFlowPercentage),
  }
}

/**
 * Metacognitive feedback (helps Zoey understand her learning)
 */
export function getMetacognitiveFeedback(timeline: DifficultyTimeline): string {
  const difficultyGain = timeline.session_current_difficulty - timeline.session_start_difficulty

  let feedback = ""

  if (timeline.in_flow_state_percentage >= 80) {
    feedback +=
      "🎯 Ausgezeichnet! Du warst die ganze Zeit in deinem optimalen Lernbereich! "
  } else if (timeline.in_flow_state_percentage >= 60) {
    feedback += "✨ Gut! Die meiste Zeit warst du im richtigen Schwierigkeitsbereich! "
  } else {
    feedback += "🌱 Die Schwierigkeit ist noch nicht ideal abgestimmt. Wir lernen davon! "
  }

  if (difficultyGain > 0) {
    feedback += `📈 Du hast dich herausgefordert und bist von Niveau ${timeline.session_start_difficulty} auf ${timeline.session_current_difficulty} gewachsen!`
  } else if (difficultyGain < 0) {
    feedback += `🛡️ Wir haben die Schwierigkeit angepasst, damit du Selbstvertrauen aufbaust.`
  } else {
    feedback += `💪 Du warst konstant auf deinem Level - perfekt zum Üben!`
  }

  return feedback
}
