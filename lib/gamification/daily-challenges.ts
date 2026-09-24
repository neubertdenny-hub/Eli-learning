/**
 * Daily Challenges System - Phase 6F-A
 * Tägliche Mini-Quests mit Bonus XP + Coins
 */

export type ChallengeType =
  | "solve_tasks"
  | "level_up"
  | "unlock_badges"
  | "streak_milestone"
  | "use_hints"
  | "perfect_streak"

export interface Challenge {
  id: string
  type: ChallengeType
  title: string
  description: string
  target: number
  reward: { xp: number; coins: number }
  difficulty: "einfach" | "mittel" | "schwer"
  icon: string
}

export interface ChallengeProgress {
  userId: string
  challengeId: string
  currentProgress: number
  completed: boolean
  completedAt?: Date
  rewardsClaimed?: boolean
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: "solve_5",
    type: "solve_tasks",
    title: "🎯 Task Master",
    description: "Löse 5 Aufgaben richtig",
    target: 5,
    reward: { xp: 50, coins: 25 },
    difficulty: "einfach",
    icon: "✅"
  },
  {
    id: "level_up_1",
    type: "level_up",
    title: "📈 Level Climber",
    description: "Erreiche 1 Level Up",
    target: 1,
    reward: { xp: 100, coins: 50 },
    difficulty: "mittel",
    icon: "🎉"
  },
  {
    id: "unlock_3_badges",
    type: "unlock_badges",
    title: "🏆 Badge Collector",
    description: "Schalte 3 Badges frei",
    target: 3,
    reward: { xp: 75, coins: 40 },
    difficulty: "mittel",
    icon: "🏆"
  },
  {
    id: "streak_7",
    type: "streak_milestone",
    title: "🔥 Inferno Week",
    description: "Erreiche 7-Tage Streak",
    target: 7,
    reward: { xp: 200, coins: 100 },
    difficulty: "schwer",
    icon: "🔥"
  },
  {
    id: "use_hints_10",
    type: "use_hints",
    title: "💡 Hint Master",
    description: "Nutze 10 Tipps",
    target: 10,
    reward: { xp: 60, coins: 30 },
    difficulty: "einfach",
    icon: "💡"
  },
  {
    id: "perfect_streak_3",
    type: "perfect_streak",
    title: "⭐ Perfect Days",
    description: "3 Tage 100% richtig",
    target: 3,
    reward: { xp: 150, coins: 75 },
    difficulty: "schwer",
    icon: "⭐"
  }
]

/**
 * Bekomme Daily Challenges für heute
 * Rotiert täglich, immer 3 aktive Challenges
 */
export function getDailyChallenges(userId: string, date: Date = new Date()): Challenge[] {
  // Hash basierend auf Datum für deterministische Auswahl
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000)
  const seed = parseInt(`${date.getFullYear()}${dayOfYear}`) + userId.charCodeAt(0)

  // Shuffle challenges basierend auf seed
  const shuffled = [...DAILY_CHALLENGES].sort(() => {
    const next = (seed * 9301 + 49297) % 233280
    return next - 116640
  })

  // Nimm die ersten 3
  return shuffled.slice(0, 3)
}

/**
 * Prüfe ob Challenge abgeschlossen ist
 */
export function isChallengeCompleted(progress: ChallengeProgress, challenge: Challenge): boolean {
  return progress.currentProgress >= challenge.target
}

/**
 * Update Challenge Progress
 */
export function updateChallengeProgress(
  progress: ChallengeProgress,
  challenge: Challenge,
  amount: number = 1
): ChallengeProgress {
  const newProgress = Math.min(progress.currentProgress + amount, challenge.target)
  return {
    ...progress,
    currentProgress: newProgress,
    completed: newProgress >= challenge.target,
    completedAt: newProgress >= challenge.target ? new Date() : undefined
  }
}

/**
 * Event-basierte Challenge Updates
 */
export function handleTaskCompleted(
  challenges: ChallengeProgress[],
  isCorrect: boolean
): ChallengeProgress[] {
  return challenges.map(progress => {
    // solve_tasks: Zähle nur korrekte Aufgaben
    if (isCorrect && progress.challengeId === "solve_5") {
      const challenge = DAILY_CHALLENGES.find(c => c.id === "solve_5")!
      return updateChallengeProgress(progress, challenge, 1)
    }
    return progress
  })
}

export function handleLevelUp(
  challenges: ChallengeProgress[]
): ChallengeProgress[] {
  return challenges.map(progress => {
    if (progress.challengeId === "level_up_1") {
      const challenge = DAILY_CHALLENGES.find(c => c.id === "level_up_1")!
      return updateChallengeProgress(progress, challenge, 1)
    }
    return progress
  })
}

export function handleBadgeUnlock(
  challenges: ChallengeProgress[]
): ChallengeProgress[] {
  return challenges.map(progress => {
    if (progress.challengeId === "unlock_3_badges") {
      const challenge = DAILY_CHALLENGES.find(c => c.id === "unlock_3_badges")!
      return updateChallengeProgress(progress, challenge, 1)
    }
    return progress
  })
}

export function handleHintUsed(
  challenges: ChallengeProgress[]
): ChallengeProgress[] {
  return challenges.map(progress => {
    if (progress.challengeId === "use_hints_10") {
      const challenge = DAILY_CHALLENGES.find(c => c.id === "use_hints_10")!
      return updateChallengeProgress(progress, challenge, 1)
    }
    return progress
  })
}

export function handleStreakMilestone(
  challenges: ChallengeProgress[],
  days: number
): ChallengeProgress[] {
  return challenges.map(progress => {
    if (progress.challengeId === "streak_7" && days >= 7) {
      const challenge = DAILY_CHALLENGES.find(c => c.id === "streak_7")!
      return updateChallengeProgress(progress, challenge, 1)
    }
    return progress
  })
}

/**
 * Berechne Tages-Bonus Rewards für alle abgeschlossenen Challenges
 */
export function calculateDailyBonusRewards(completedChallenges: ChallengeProgress[]): { xp: number; coins: number } {
  let totalXp = 0
  let totalCoins = 0

  completedChallenges.forEach(progress => {
    if (progress.completed && !progress.rewardsClaimed) {
      const challenge = DAILY_CHALLENGES.find(c => c.id === progress.challengeId)
      if (challenge) {
        totalXp += challenge.reward.xp
        totalCoins += challenge.reward.coins
      }
    }
  })

  return { xp: totalXp, coins: totalCoins }
}
