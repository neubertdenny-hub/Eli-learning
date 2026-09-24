/**
 * Leaderboard System - Phase 6F-B
 * Rankings basiert auf XP, Coins, Level
 */

export type LeaderboardPeriod = "weekly" | "monthly" | "all-time"

export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  level: number
  totalXp: number
  totalCoins: number
  streak: number
  badges: number
  avatar?: string
}

export interface LeaderboardData {
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
  userRank?: number
  userEntry?: LeaderboardEntry
}

/**
 * Mock Leaderboard Daten
 * In Production: aus echter DB aggregieren
 */
const MOCK_USERS: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "user-001",
    userName: "Alex Mathe-Ninja",
    level: 12,
    totalXp: 8500,
    totalCoins: 2100,
    streak: 21,
    badges: 8,
  },
  {
    rank: 2,
    userId: "user-002",
    userName: "Emma Zahlen-Pro",
    level: 11,
    totalXp: 7800,
    totalCoins: 1950,
    streak: 18,
    badges: 7,
  },
  {
    rank: 3,
    userId: "user-003",
    userName: "Felix Bruch-King",
    level: 10,
    totalXp: 7200,
    totalCoins: 1800,
    streak: 15,
    badges: 6,
  },
  {
    rank: 4,
    userId: "user-004",
    userName: "Zoey Lern-Star",
    level: 9,
    totalXp: 6500,
    totalCoins: 1625,
    streak: 12,
    badges: 5,
  },
  {
    rank: 5,
    userId: "user-005",
    userName: "Leon Rechner",
    level: 9,
    totalXp: 6300,
    totalCoins: 1575,
    streak: 10,
    badges: 5,
  },
  {
    rank: 6,
    userId: "user-006",
    userName: "Julia Gleich-Löser",
    level: 8,
    totalXp: 5800,
    totalCoins: 1450,
    streak: 8,
    badges: 4,
  },
  {
    rank: 7,
    userId: "user-007",
    userName: "Marco Mathe-Fan",
    level: 8,
    totalXp: 5500,
    totalCoins: 1375,
    streak: 6,
    badges: 4,
  },
  {
    rank: 8,
    userId: "user-008",
    userName: "Sophie Zahl-Meisterin",
    level: 7,
    totalXp: 5000,
    totalCoins: 1250,
    streak: 5,
    badges: 3,
  },
  {
    rank: 9,
    userId: "user-009",
    userName: "Tim Übungs-Fleiß",
    level: 7,
    totalXp: 4800,
    totalCoins: 1200,
    streak: 4,
    badges: 3,
  },
  {
    rank: 10,
    userId: "user-010",
    userName: "Laura Lern-Drang",
    level: 6,
    totalXp: 4200,
    totalCoins: 1050,
    streak: 3,
    badges: 2,
  },
]

/**
 * Bekomme Leaderboard für einen Zeitraum
 * Gibt Top 10 + User Position zurück
 */
export function getLeaderboard(
  userId: string,
  period: LeaderboardPeriod = "all-time"
): LeaderboardData {
  // In Production: Filter nach Zeitraum + Aggregiere Stats
  const entries = [...MOCK_USERS]

  // Finde User Rank
  const userEntry = entries.find(e => e.userId === userId)
  const userRank = userEntry ? userEntry.rank : undefined

  // Gebe Top 10 zurück
  const topEntries = entries.slice(0, 10)

  return {
    period,
    entries: topEntries,
    userRank,
    userEntry,
  }
}

/**
 * Berechne User Ranking basiert auf Metriken
 */
export function calculateRankingScore(entry: LeaderboardEntry): number {
  // XP ist Hauptmetrik (70%)
  const xpScore = entry.totalXp * 0.7

  // Level Bonus (20%)
  const levelScore = entry.level * 100 * 0.2

  // Streak & Badges Bonus (10%)
  const streakScore = entry.streak * 10 * 0.05
  const badgeScore = entry.badges * 50 * 0.05

  return Math.round(xpScore + levelScore + streakScore + badgeScore)
}

/**
 * Bekomme Rank Position eines Users
 */
export function getUserRankPosition(userId: string): number {
  const user = MOCK_USERS.find(u => u.userId === userId)
  return user?.rank || MOCK_USERS.length + 1
}

/**
 * Bekomme wie viele XP bis nächster Rank
 */
export function getXpToNextRank(currentRank: number, currentXp: number): number {
  if (currentRank === 1) return 0 // Already #1

  const nextUser = MOCK_USERS.find(u => u.rank === currentRank - 1)
  if (!nextUser) return 0

  const xpDifference = nextUser.totalXp - currentXp
  return Math.max(0, xpDifference)
}

/**
 * Format Leaderboard Entry für Display
 */
export function formatLeaderboardEntry(entry: LeaderboardEntry): string {
  return `#${entry.rank} ${entry.userName} • Level ${entry.level} • ${entry.totalXp} XP`
}
