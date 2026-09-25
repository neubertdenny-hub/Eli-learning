/**
 * Reward Engine für Phase 6 Gamification
 *
 * Zentrale regelbasierte Engine für:
 * - XP Vergabe
 * - Coins
 * - Badge Progress
 * - Level Calculations
 *
 * Alle XP-Ereignisse sind idempotent (keine Duplikate durch Reload)
 */

import { getDatabase } from "@/lib/db/connection"
import {
  rewardEvents,
  userRewards,
  badges,
  userBadges,
} from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export type RewardEventType =
  | "TASK_CORRECT_INDEPENDENT"
  | "TASK_CORRECT_WITH_HELP_L1_L2"
  | "TASK_CORRECT_WITH_HELP_L3"
  | "SELF_CORRECTION"
  | "FOUNDATION_GAP_CLOSED"
  | "REVIEW_COMPLETED"
  | "TRANSFER_SUCCESS"
  | "CHALLENGE_COMPLETED"
  | "MISSION_COMPLETED"

export interface RewardConfig {
  xp: number
  coins: number
  badgeId?: string
}

export interface RewardResult {
  xp: number
  coins: number
  newLevel?: number
  leveledUp: boolean
}

// Zentrale Reward-Tabelle (Spielregeln)
const REWARD_TABLE: Record<RewardEventType, RewardConfig> = {
  TASK_CORRECT_INDEPENDENT: { xp: 10, coins: 1 },
  TASK_CORRECT_WITH_HELP_L1_L2: { xp: 7, coins: 1 },
  TASK_CORRECT_WITH_HELP_L3: { xp: 5, coins: 0 },
  SELF_CORRECTION: { xp: 5, coins: 2 },
  FOUNDATION_GAP_CLOSED: { xp: 10, coins: 3 },
  REVIEW_COMPLETED: { xp: 8, coins: 1 },
  TRANSFER_SUCCESS: { xp: 12, coins: 2 },
  CHALLENGE_COMPLETED: { xp: 15, coins: 3 },
  MISSION_COMPLETED: { xp: 20, coins: 5 },
}

// Level Kurve: [0 XP, 100 XP, 250 XP, 450 XP, 700 XP, 1000 XP, ...]
// Progressive curve (jeweils +150, +200, +250...)
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500,
]

/**
 * Berechne Level aus XP
 */
export function calculateLevel(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

/**
 * Berechne XP-Schwelle für ein Level
 */
export function xpForLevel(level: number): number {
  if (level < 1 || level > LEVEL_THRESHOLDS.length)
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return LEVEL_THRESHOLDS[level - 1]
}

/**
 * Berechne XP-Fortschritt zum nächsten Level
 */
export function xpProgress(totalXp: number): {
  level: number
  currentXp: number
  nextLevelXp: number
  progressPercent: number
} {
  const level = calculateLevel(totalXp || 0)
  const currentLevelXp = xpForLevel(level) || 0
  const nextLevelXp =
    level < LEVEL_THRESHOLDS.length
      ? LEVEL_THRESHOLDS[level]
      : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 500

  const progress = (totalXp || 0) - currentLevelXp
  const needed = nextLevelXp - currentLevelXp

  return {
    level,
    currentXp: progress,
    nextLevelXp: needed,
    progressPercent: Math.min((progress / needed) * 100, 100),
  }
}

/**
 * Processiere Reward Event
 * Idempotent: wiederholtes Aufrufen mit gleicher sourceId führt zu keinem doppelten XP
 */
export async function processReward(
  userId: string,
  eventType: RewardEventType,
  sourceId: string
): Promise<RewardResult> {
  try {
    // 1. Prüfe auf Duplikat
    const db = getDatabase()
    const existing = await db
      .select()
      .from(rewardEvents)
      .where(
        and(
          eq(rewardEvents.userId, userId),
          eq(rewardEvents.eventType, eventType),
          eq(rewardEvents.sourceId, sourceId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      console.log(`[Reward] Duplikat ignoriert: ${userId}/${eventType}/${sourceId}`)
      return { xp: 0, coins: 0, leveledUp: false }
    }

    // 2. Hole Reward Config
    const config = REWARD_TABLE[eventType]
    if (!config) {
      console.warn(`[Reward] Unbekannter eventType: ${eventType}`)
      return { xp: 0, coins: 0, leveledUp: false }
    }

    // 3. Hole aktuellen Rewards Stand
    let userRewardsRecord = await db
      .select()
      .from(userRewards)
      .where(eq(userRewards.userId, userId))
      .limit(1)

    if (!userRewardsRecord || userRewardsRecord.length === 0) {
      // Initalisiere
      await db.insert(userRewards).values({
        userId,
        totalXp: 0,
        totalCoins: 0,
        currentLevel: 1,
        lastRewardAt: new Date().toISOString(),
      })
      userRewardsRecord = await db
        .select()
        .from(userRewards)
        .where(eq(userRewards.userId, userId))
        .limit(1)
    }

    const oldRecord = userRewardsRecord[0]!
    const levelBefore = oldRecord.currentLevel || 1

    // 4. Speichere Reward Event (Audit Trail)
    await db.insert(rewardEvents).values({
      id: `${userId}-${eventType}-${sourceId}-${Date.now()}`,
      userId,
      eventType,
      sourceId,
      xpAmount: config.xp,
      coinsAmount: config.coins,
    } as any)

    // 5. Update User Rewards
    const newXp = (oldRecord.totalXp || 0) + config.xp
    const newCoins = (oldRecord.totalCoins || 0) + config.coins
    const newLevel = calculateLevel(newXp)

    await db
      .update(userRewards)
      .set({
        totalXp: newXp,
        totalCoins: newCoins,
        currentLevel: newLevel,
        lastRewardAt: new Date().toISOString(),
      })
      .where(eq(userRewards.userId, userId))

    // 6. Checke Badge Progress
    // (wird später in separater Badge Engine gemacht)

    const leveledUp = newLevel > (levelBefore || 1)

    console.log(
      `[Reward] ${userId} +${config.xp} XP (+${config.coins} Coins) | Level ${levelBefore} → ${newLevel}`
    )

    return {
      xp: config.xp,
      coins: config.coins,
      newLevel: leveledUp ? newLevel : undefined,
      leveledUp,
    }
  } catch (error) {
    console.error("[Reward Engine Error]", error)
    throw error
  }
}

/**
 * Hole kompletten Rewards Status für einen User
 */
export async function getUserRewards(userId: string) {
  const db = getDatabase()
  const record = await db
    .select()
    .from(userRewards)
    .where(eq(userRewards.userId, userId))
    .limit(1)

  if (!record || record.length === 0) {
    return {
      totalXp: 0,
      totalCoins: 0,
      currentLevel: 1,
      xpProgress: xpProgress(0),
    }
  }

  const r = record[0]!
  return {
    totalXp: r.totalXp || 0,
    totalCoins: r.totalCoins || 0,
    currentLevel: r.currentLevel || 1,
    xpProgress: xpProgress(r.totalXp || 0),
  }
}

/**
 * Setze XP für User (Admin-Funktion für Tests)
 */
export async function setUserXp(userId: string, totalXp: number) {
  const db = getDatabase()
  const newLevel = calculateLevel(totalXp)

  await db
    .update(userRewards)
    .set({
      totalXp,
      currentLevel: newLevel,
    })
    .where(eq(userRewards.userId, userId))
}

/**
 * Hole alle Reward Events für einen User (Audit)
 */
export async function getUserRewardEvents(userId: string) {
  const db = getDatabase()
  return await db
    .select()
    .from(rewardEvents)
    .where(eq(rewardEvents.userId, userId))
}
