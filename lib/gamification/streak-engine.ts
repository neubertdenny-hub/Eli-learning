/**
 * Streak Engine für Phase 6B
 *
 * Lernserien ohne aggressives Verlustdesign
 * Nur ECHTE Lernsessions zählen (mindestens 1 richtige Aufgabe)
 * Kein Druck! "Heute starten wir neu 🚀"
 */

import { getDatabase } from "@/lib/db/connection"
import { learningStreaks, learningMissions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/**
 * Markiere einen Tag als "Lerntag"
 * Wird aufgerufen wenn Mission abgeschlossen oder Task erfolgreich
 */
export async function recordLearningDay(userId: string): Promise<{
  currentStreak: number
  bestStreak: number
  isNewDay: boolean
}> {
  try {
    const db = getDatabase()
    const today = new Date().toISOString().split("T")[0]

    // 1. Hole aktuellen Streak
    let streakRecord = await db
      .select()
      .from(learningStreaks)
      .where(eq(learningStreaks.userId, userId))
      .limit(1)

    if (!streakRecord || streakRecord.length === 0) {
      // Initalisiere
      await db.insert(learningStreaks).values({
        userId,
        currentStreak: 1,
        bestStreak: 1,
        lastActiveDate: today,
      } as any)
      return { currentStreak: 1, bestStreak: 1, isNewDay: true }
    }

    const streak = streakRecord[0]!
    const lastActive = streak.lastActiveDate

    // 2. War heute schon aktiv? (Check same-day)
    const isNewDay = lastActive !== today

    if (isNewDay) {
      // 3. War GESTERN aktiv? (consecutive check)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      const wasYesterdayActive = lastActive === yesterdayStr
      const newStreak = wasYesterdayActive ? (streak.currentStreak || 0) + 1 : 1
      const newBest = Math.max(newStreak, streak.bestStreak || 0)

      // Update
      await db
        .update(learningStreaks)
        .set({
          currentStreak: newStreak,
          bestStreak: newBest,
          lastActiveDate: today,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(learningStreaks.userId, userId))

      console.log(
        `[Streak] ${userId}: ${streak.currentStreak} → ${newStreak} | Best: ${newBest}`
      )

      return {
        currentStreak: newStreak,
        bestStreak: newBest,
        isNewDay: true,
      }
    }

    // Heute bereits aktiv
    return {
      currentStreak: streak.currentStreak || 1,
      bestStreak: streak.bestStreak || 1,
      isNewDay: false,
    }
  } catch (error) {
    console.error("[Streak Engine Error]", error)
    throw error
  }
}

/**
 * Hole aktuellen Streak für User
 */
export async function getUserStreak(userId: string) {
  try {
    const db = getDatabase()
    const record = await db
      .select()
      .from(learningStreaks)
      .where(eq(learningStreaks.userId, userId))
      .limit(1)

    if (!record || record.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        lastActiveDate: null,
      }
    }

    const s = record[0]!
    return {
      currentStreak: s.currentStreak || 0,
      bestStreak: s.bestStreak || 0,
      lastActiveDate: s.lastActiveDate,
    }
  } catch (error) {
    console.error("[Get Streak Error]", error)
    return { currentStreak: 0, bestStreak: 0, lastActiveDate: null }
  }
}

/**
 * Friendly Message für Streak Status
 * KEINE negativen Meldungen!
 */
export function getStreakMessage(
  currentStreak: number,
  lastActiveDate: string | null
): string {
  if (currentStreak === 0) {
    return "🚀 Heute starten wir neu!"
  }
  if (currentStreak === 1) {
    return "🔥 1 Tag - guter Start!"
  }
  if (currentStreak <= 3) {
    return `🔥 ${currentStreak} Tage - du bist dran!`
  }
  if (currentStreak <= 7) {
    return `🔥🔥 ${currentStreak} Tage - sehr gut!`
  }
  if (currentStreak <= 14) {
    return `🔥🔥🔥 ${currentStreak} Tage - wow!`
  }
  return `🔥🔥🔥 ${currentStreak} Tage - Legende! 👑`
}
