/**
 * Mission System
 * Structures 20-minute learning sessions into engaging "missions"
 * - 5 carefully selected problems
 * - Progressive difficulty
 * - Time-based pacing
 * - XP rewards based on performance
 */

import { SkillMastery } from "./mastery-engine"

export type MissionDifficulty = "easy" | "medium" | "hard" | "challenge"

export interface Mission {
  id: string
  student_id: string
  title: string // "Negative Number Challenge", "Geometry Master Quest"
  description: string
  theme: string // "negative_numbers", "fractions", "geometry"
  difficulty: MissionDifficulty
  total_time_minutes: number // 20 typical
  task_count: number // Usually 5
  tasks: MissionTask[]
  status: "not_started" | "in_progress" | "completed" | "abandoned"
  created_at: Date
  started_at?: Date
  completed_at?: Date
  total_time_spent_minutes: number
  tasks_completed: number
  total_xp_earned: number
  streak_bonus_multiplier: number // 1.0-1.5x for streaks
}

export interface MissionTask {
  id: string
  mission_id: string
  task_number: number // 1-5
  skill_id: string
  skill_name: string
  problem_statement: string
  difficulty_level: number // 1-5, adapts during mission
  estimated_time_seconds: number // Paces the mission
  is_completed: boolean
  user_answer?: string
  classification?: string // A-F from Phase 4A
  help_level_used: number
  attempts: number
  time_spent_seconds: number
  xp_earned: number
  is_breakthrough: boolean // First time solving this skill
}

export interface MissionReward {
  mission_id: string
  xp_total: number
  xp_breakdown: {
    completion: number // 10-50 XP per task
    difficulty: number // 0-25 XP based on difficulty
    streak: number // 0-50 XP for streaks
    speed: number // 0-20 XP for finishing on time
    perfect: number // 0-100 XP for 100% accuracy
  }
  badges_earned: Badge[]
  next_level_progress: number // % toward next level
  total_xp_ever: number
  current_level: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned_at: Date
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface XPSystem {
  total_xp: number
  current_level: number
  xp_to_next_level: number
  level_progress: number // 0-100%
  lifetime_missions: number
  completed_missions: number
  current_streak_missions: number
  best_streak_missions: number
  badges: Badge[]
  rank_tier: "Novice" | "Apprentice" | "Scholar" | "Master" | "Sage" // Based on level
}

/**
 * Build a 20-minute mission from available skills
 * Strategy:
 * 1. Get overdue skills (spaced repetition)
 * 2. Mix with favorite topics
 * 3. Include one challenge (stretch)
 * 4. End with celebration (easy win)
 */
export function buildMission(
  studentId: string,
  allSkills: SkillMastery[],
  favoriteTopics: string[],
  currentLevel: number,
  streakDays: number
): Mission {
  const tasks: MissionTask[] = []
  const usedSkills = new Set<string>()

  // Task 1: Spaced repetition (overdue review)
  const overdueSkills = allSkills.filter(
    (s) => new Date(s.next_review) <= new Date() && !usedSkills.has(s.skill_id)
  )
  if (overdueSkills.length > 0) {
    const skill = overdueSkills[Math.floor(Math.random() * overdueSkills.length)]
    tasks.push(buildMissionTask(skill, 1, 240)) // 4 minutes
    usedSkills.add(skill.skill_id)
  }

  // Task 2: Favorite topic (engagement)
  const favoriteSkills = allSkills.filter(
    (s) =>
      favoriteTopics.some((topic) => s.skill_name.includes(topic)) &&
      !usedSkills.has(s.skill_id)
  )
  if (favoriteSkills.length > 0) {
    const skill = favoriteSkills[Math.floor(Math.random() * favoriteSkills.length)]
    tasks.push(buildMissionTask(skill, 2, 300)) // 5 minutes
    usedSkills.add(skill.skill_id)
  }

  // Task 3: Challenge (stretch difficulty)
  const challenge = allSkills
    .filter((s) => !usedSkills.has(s.skill_id))
    .sort((a, b) => a.current_level - b.current_level)[0]
  if (challenge) {
    const task = buildMissionTask(challenge, 3, 360) // 6 minutes
    task.difficulty_level = Math.min(5, challenge.current_level + 1) // Bump difficulty
    tasks.push(task)
    usedSkills.add(challenge.skill_id)
  }

  // Task 4: Consolidation (mid-level)
  const consolidation = allSkills.filter((s) => !usedSkills.has(s.skill_id)).find(
    (s) => s.current_level >= 2 && s.current_level <= 4
  )
  if (consolidation) {
    tasks.push(buildMissionTask(consolidation, 4, 300)) // 5 minutes
    usedSkills.add(consolidation.skill_id)
  }

  // Task 5: Victory lap (easy win to end on high note)
  const victorySkill = allSkills
    .filter((s) => !usedSkills.has(s.skill_id))
    .sort((a, b) => b.current_level - a.current_level)[0]
  if (victorySkill) {
    const task = buildMissionTask(victorySkill, 5, 180) // 3 minutes
    task.difficulty_level = Math.max(1, victorySkill.current_level - 1) // Easier
    tasks.push(task)
  }

  const difficulty = calculateMissionDifficulty(tasks)
  const theme = extractThemeFromTasks(tasks)

  return {
    id: `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    student_id: studentId,
    title: generateMissionTitle(theme, difficulty),
    description: generateMissionDescription(theme, tasks.length),
    theme,
    difficulty,
    total_time_minutes: 20,
    task_count: tasks.length,
    tasks,
    status: "not_started",
    created_at: new Date(),
    total_time_spent_minutes: 0,
    tasks_completed: 0,
    total_xp_earned: 0,
    streak_bonus_multiplier: Math.min(1.5, 1 + streakDays * 0.05), // +5% per day, capped at 1.5x
  }
}

function buildMissionTask(
  skill: SkillMastery,
  taskNumber: number,
  estimatedSeconds: number
): MissionTask {
  return {
    id: `task_${Date.now()}_${taskNumber}`,
    mission_id: "",
    task_number: taskNumber,
    skill_id: skill.skill_id,
    skill_name: skill.skill_name,
    problem_statement: "", // Will be generated by content engine
    difficulty_level: skill.current_level + 1, // Slight stretch
    estimated_time_seconds: estimatedSeconds,
    is_completed: false,
    help_level_used: 0,
    attempts: 0,
    time_spent_seconds: 0,
    xp_earned: 0,
    is_breakthrough: false,
  }
}

/**
 * Calculate mission difficulty from task composition
 */
function calculateMissionDifficulty(tasks: MissionTask[]): MissionDifficulty {
  const avgDifficulty = tasks.reduce((sum, t) => sum + t.difficulty_level, 0) / tasks.length

  if (avgDifficulty < 2) return "easy"
  if (avgDifficulty < 3) return "medium"
  if (avgDifficulty < 4) return "hard"
  return "challenge"
}

function extractThemeFromTasks(tasks: MissionTask[]): string {
  // Find most common topic
  const topicCounts: Record<string, number> = {}
  tasks.forEach((t) => {
    const topic = t.skill_name.split("_")[0] || "mixed"
    topicCounts[topic] = (topicCounts[topic] || 0) + 1
  })

  return Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a])[0] ||
    "mixed"
}

function generateMissionTitle(theme: string, difficulty: MissionDifficulty): string {
  const titles: Record<string, Record<MissionDifficulty, string>> = {
    addition: {
      easy: "Addition Starter",
      medium: "Addition Quest",
      hard: "Addition Master",
      challenge: "Addition Legend",
    },
    subtraction: {
      easy: "Subtraction Basics",
      medium: "Subtraction Challenge",
      hard: "Subtraction Mastery",
      challenge: "Subtraction Champion",
    },
    negative_numbers: {
      easy: "Negative Number Explorer",
      medium: "Negative Number Quest",
      hard: "Negative Number Master",
      challenge: "Negative Number Sage",
    },
    geometry: {
      easy: "Shape Adventure",
      medium: "Geometry Quest",
      hard: "Geometry Master",
      challenge: "Geometry Legend",
    },
    fractions: {
      easy: "Fraction Foundations",
      medium: "Fraction Quest",
      hard: "Fraction Master",
      challenge: "Fraction Champion",
    },
  }

  return (
    titles[theme]?.[difficulty] ||
    (difficulty === "easy"
      ? "Learning Mission"
      : difficulty === "medium"
        ? "Skill Challenge"
        : difficulty === "hard"
          ? "Expert Quest"
          : "Master Challenge")
  )
}

function generateMissionDescription(theme: string, taskCount: number): string {
  const descriptions: Record<string, string> = {
    addition: "Meister werde in Addition mit 5 progressiven Aufgaben! 🔢",
    subtraction: "Beherrsche Subtraktion - vom einfach bis schwer! 📉",
    negative_numbers: "Negative Zahlen verstehen - eine aufregende Reise! ❄️",
    geometry: "Geometrie entdecken - Formen, Flächen, Volumen! 📐",
    fractions: "Bruchrechnung meistern - Schritt für Schritt! 🍕",
  }

  return (
    descriptions[theme] ||
    `Löse ${taskCount} Aufgaben in 20 Minuten und verdiene XP! ⚡`
  )
}

/**
 * Calculate XP rewards based on performance
 */
export function calculateMissionRewards(
  mission: Mission,
  perfectScore: boolean,
  finishedOnTime: boolean,
  streakDays: number
): MissionReward {
  let totalXP = 0
  const breakdown = {
    completion: 0,
    difficulty: 0,
    streak: 0,
    speed: 0,
    perfect: 0,
  }

  // 1. Completion XP: 10-50 per task based on difficulty
  const completionXP = mission.tasks.reduce((sum, task) => {
    const baseXP = 10 + task.difficulty_level * 8 // 18-50 XP per task
    return sum + baseXP
  }, 0)
  breakdown.completion = Math.floor(completionXP)
  totalXP += completionXP

  // 2. Difficulty bonus: Harder missions reward more
  const difficultyMultiplier =
    mission.difficulty === "easy"
      ? 1.0
      : mission.difficulty === "medium"
        ? 1.2
        : mission.difficulty === "hard"
          ? 1.5
          : 2.0
  breakdown.difficulty = Math.floor(totalXP * (difficultyMultiplier - 1))
  totalXP *= difficultyMultiplier

  // 3. Streak bonus: Up to 50% more for streaks
  const streakBonus = Math.min(50, streakDays * 2) // +2 per day, max 50 XP
  breakdown.streak = streakBonus
  totalXP += streakBonus

  // 4. Speed bonus: Finished in 80% of time or less
  const timeUsedRatio =
    mission.total_time_spent_minutes / mission.total_time_minutes
  if (finishedOnTime && timeUsedRatio < 0.8) {
    const speedBonus = Math.floor(20 * (0.8 - timeUsedRatio) / 0.8)
    breakdown.speed = speedBonus
    totalXP += speedBonus
  }

  // 5. Perfect score bonus: 100 XP for all A classifications
  if (perfectScore) {
    breakdown.perfect = 100
    totalXP += 100
  }

  // Apply streak multiplier
  totalXP = Math.floor(totalXP * mission.streak_bonus_multiplier)

  return {
    mission_id: mission.id,
    xp_total: totalXP,
    xp_breakdown: breakdown,
    badges_earned: determineBadges(mission, perfectScore, finishedOnTime),
    next_level_progress: (totalXP % 500) / 5, // XP toward next level
    total_xp_ever: totalXP, // Will be added to player's total
    current_level: Math.floor(totalXP / 500) + 1, // Rough estimate
  }
}

/**
 * Determine badges earned in mission
 */
function determineBadges(
  mission: Mission,
  perfectScore: boolean,
  onTime: boolean
): Badge[] {
  const badges: Badge[] = []
  const now = new Date()

  if (perfectScore) {
    badges.push({
      id: "perfect_mission",
      name: "Perfect! 💯",
      description: "Alle Aufgaben beim ersten Versuch gelöst!",
      icon: "⭐",
      earned_at: now,
      rarity: "epic",
    })
  }

  if (onTime) {
    badges.push({
      id: "speedrunner",
      name: "Speedrunner ⚡",
      description: "Mission in weniger als 20 Minuten absolviert!",
      icon: "🏃",
      earned_at: now,
      rarity: "rare",
    })
  }

  if (mission.tasks.some((t) => t.is_breakthrough)) {
    badges.push({
      id: "breakthrough",
      name: "Durchbruch! 🔓",
      description: "Neue Fähigkeit gemeistert!",
      icon: "🌟",
      earned_at: now,
      rarity: "legendary",
    })
  }

  if (mission.difficulty === "challenge") {
    badges.push({
      id: "champion",
      name: "Champion 👑",
      description: "Challenge-Mission absolviert!",
      icon: "👑",
      earned_at: now,
      rarity: "legendary",
    })
  }

  return badges
}

/**
 * Update XP system based on mission completion
 */
export function updateXPSystem(
  currentXPSystem: XPSystem,
  missionReward: MissionReward,
  completedMission: boolean
): XPSystem {
  const newTotalXP = currentXPSystem.total_xp + missionReward.xp_total
  const newLevel = Math.floor(newTotalXP / 500) + 1
  const xpInLevel = newTotalXP % 500
  const xpToNext = 500 - xpInLevel

  let newStreak = currentXPSystem.current_streak_missions
  if (completedMission) {
    newStreak += 1
  } else {
    newStreak = 0 // Reset on abandonment
  }

  const rankTier: "Novice" | "Apprentice" | "Scholar" | "Master" | "Sage" =
    newLevel < 10
      ? "Novice"
      : newLevel < 25
        ? "Apprentice"
        : newLevel < 50
          ? "Scholar"
          : newLevel < 75
            ? "Master"
            : "Sage"

  return {
    total_xp: newTotalXP,
    current_level: newLevel,
    xp_to_next_level: xpToNext,
    level_progress: Math.floor((xpInLevel / 500) * 100),
    lifetime_missions: currentXPSystem.lifetime_missions + 1,
    completed_missions: completedMission
      ? currentXPSystem.completed_missions + 1
      : currentXPSystem.completed_missions,
    current_streak_missions: newStreak,
    best_streak_missions: Math.max(
      currentXPSystem.best_streak_missions,
      newStreak
    ),
    badges: [...currentXPSystem.badges, ...missionReward.badges_earned],
    rank_tier: rankTier,
  }
}

/**
 * Dynamic difficulty adjustment during mission
 * If Zoey struggles (C/D/E classifications), next task gets easier
 * If Zoey excels (A with 0 help), next task gets harder
 */
export function adjustTaskDifficulty(
  currentTask: MissionTask,
  classification: string,
  helpLevelUsed: number,
  nextTask: MissionTask
): MissionTask {
  const adjusted = { ...nextTask }

  if (classification === "A" && helpLevelUsed === 0) {
    // Perfect! Make next task harder
    adjusted.difficulty_level = Math.min(5, adjusted.difficulty_level + 1)
    adjusted.estimated_time_seconds = Math.floor(
      adjusted.estimated_time_seconds * 1.2
    )
  } else if (classification === "D" || classification === "E") {
    // Struggling, make next task easier
    adjusted.difficulty_level = Math.max(1, adjusted.difficulty_level - 1)
    adjusted.estimated_time_seconds = Math.floor(
      adjusted.estimated_time_seconds * 0.8
    )
  }

  return adjusted
}
