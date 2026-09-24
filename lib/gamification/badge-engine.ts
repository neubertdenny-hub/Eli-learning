/**
 * Badge Engine für Phase 6B
 *
 * 15 sinnvolle Badges basierend auf echten Lernleistungen
 * Belohne: Durchhalten, Selbstkorrektur, Fortschritt
 * NICHT: nur Volltreffer
 */

import { getDatabase } from "@/lib/db/connection"
import { badges, userBadges, rewardEvents, userRewards, learningStreaks } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export interface BadgeDefinition {
  slug: string
  name: string
  description: string
  icon: string
  requirement: {
    type: "missions_completed" | "self_corrections" | "streak" | "xp" | "tasks_independent" | "level"
    value: number
  }
}

// Die 15 Badges - sinnvoll, nicht trivial
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: "first_step",
    name: "🌟 Erster Schritt",
    description: "Erste Mission abgeschlossen",
    icon: "🌟",
    requirement: { type: "missions_completed", value: 1 },
  },
  {
    slug: "on_fire",
    name: "🔥 Drangeblieben",
    description: "3 Lerntage hintereinander",
    icon: "🔥",
    requirement: { type: "streak", value: 3 },
  },
  {
    slug: "one_week",
    name: "🚀 Eine Woche ELI",
    description: "7 aktive Lerntage",
    icon: "🚀",
    requirement: { type: "streak", value: 7 },
  },
  {
    slug: "independent_learner",
    name: "🧠 Selbst geschafft",
    description: "10 Aufgaben ohne Hilfe gelöst",
    icon: "🧠",
    requirement: { type: "tasks_independent", value: 10 },
  },
  {
    slug: "never_give_up",
    name: "💪 Nicht aufgegeben",
    description: "5 Fehler selbst korrigiert",
    icon: "💪",
    requirement: { type: "self_corrections", value: 5 },
  },
  {
    slug: "foundation_filler",
    name: "🛠️ Lückenfüller",
    description: "Ersten Foundation Gap geschlossen",
    icon: "🛠️",
    requirement: { type: "missions_completed", value: 5 }, // Proxy: nach 5 Missionen
  },
  {
    slug: "mission_master",
    name: "📚 Mathe-Mission",
    description: "10 Missionen abgeschlossen",
    icon: "📚",
    requirement: { type: "missions_completed", value: 10 },
  },
  {
    slug: "first_hundred",
    name: "⭐ Erste 100 XP",
    description: "100 XP gesammelt",
    icon: "⭐",
    requirement: { type: "xp", value: 100 },
  },
  {
    slug: "level_up",
    name: "⬆️ Level 2",
    description: "Erreiche Level 2",
    icon: "⬆️",
    requirement: { type: "level", value: 2 },
  },
  {
    slug: "consistency_week",
    name: "📅 Konsistent",
    description: "14 Lerntage hintereinander",
    icon: "📅",
    requirement: { type: "streak", value: 14 },
  },
  {
    slug: "fifty_tasks",
    name: "🎯 50er Club",
    description: "50 Aufgaben gelöst",
    icon: "🎯",
    requirement: { type: "missions_completed", value: 50 }, // Proxy
  },
  {
    slug: "level_five",
    name: "🏆 Level 5",
    description: "Erreiche Level 5",
    icon: "🏆",
    requirement: { type: "level", value: 5 },
  },
  {
    slug: "self_correction_master",
    name: "✅ Fehler-Finder",
    description: "10 Fehler selbst korrigiert",
    icon: "✅",
    requirement: { type: "self_corrections", value: 10 },
  },
  {
    slug: "month_warrior",
    name: "👑 Monat-Krieger",
    description: "30 Lerntage im Monat",
    icon: "👑",
    requirement: { type: "streak", value: 30 },
  },
  {
    slug: "elite_learner",
    name: "🌠 Elite",
    description: "Level 10 erreicht",
    icon: "🌠",
    requirement: { type: "level", value: 10 },
  },
]

/**
 * Initialisiere alle Badges in der DB
 */
export async function initializeBadges() {
  try {
    const db = getDatabase()

    for (const badgeDef of BADGE_DEFINITIONS) {
      // Checke ob schon existiert
      const existing = await db
        .select()
        .from(badges)
        .where(eq(badges.slug, badgeDef.slug))
        .limit(1)

      if (!existing || existing.length === 0) {
        await db.insert(badges).values({
          id: `badge-${badgeDef.slug}`,
          slug: badgeDef.slug,
          name: badgeDef.name,
          description: badgeDef.description,
          requirement: JSON.stringify(badgeDef.requirement),
        } as any)
        console.log(`[Badges] Initialized: ${badgeDef.slug}`)
      }
    }
  } catch (error) {
    console.error("[Badge Init Error]", error)
  }
}

/**
 * Checke ob User ein Badge verdient hat
 */
export async function checkBadgeProgress(userId: string): Promise<string[]> {
  try {
    const db = getDatabase()
    const unlockedBadges: string[] = []

    // Hole User Stats
    const rewards = await db
      .select()
      .from(userRewards)
      .where(eq(userRewards.userId, userId))
      .limit(1)

    const streak = await db
      .select()
      .from(learningStreaks)
      .where(eq(learningStreaks.userId, userId))
      .limit(1)

    const rewardEventsRecords = await db
      .select()
      .from(rewardEvents)
      .where(eq(rewardEvents.userId, userId))

    const totalXp = rewards?.[0]?.totalXp || 0
    const currentLevel = rewards?.[0]?.currentLevel || 1
    const currentStreak = streak?.[0]?.currentStreak || 0
    const selfCorrections = rewardEventsRecords.filter(
      (e) => e.eventType === "SELF_CORRECTION"
    ).length
    const totalTasks = rewardEventsRecords.length
    const independentTasks = rewardEventsRecords.filter(
      (e) => e.eventType === "TASK_CORRECT_INDEPENDENT"
    ).length

    // Hole bereits freigeschaltete Badges
    const alreadyUnlocked = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))

    const unlockedSlugs = new Set(
      alreadyUnlocked.map((ub) => {
        // Hole Badge Definition
        return ub.badgeId
      })
    )

    // Check alle Badges
    for (const badgeDef of BADGE_DEFINITIONS) {
      // Skip wenn bereits freigeschaltet
      if (unlockedSlugs.has(`badge-${badgeDef.slug}`)) {
        continue
      }

      let shouldUnlock = false

      switch (badgeDef.requirement.type) {
        case "missions_completed":
          shouldUnlock = totalTasks >= badgeDef.requirement.value
          break
        case "self_corrections":
          shouldUnlock = selfCorrections >= badgeDef.requirement.value
          break
        case "streak":
          shouldUnlock = currentStreak >= badgeDef.requirement.value
          break
        case "xp":
          shouldUnlock = totalXp >= badgeDef.requirement.value
          break
        case "tasks_independent":
          shouldUnlock = independentTasks >= badgeDef.requirement.value
          break
        case "level":
          shouldUnlock = currentLevel >= badgeDef.requirement.value
          break
      }

      if (shouldUnlock) {
        // Unlock Badge
        await db.insert(userBadges).values({
          userId,
          badgeId: `badge-${badgeDef.slug}`,
          unlockedAt: new Date().toISOString(),
        } as any)

        unlockedBadges.push(badgeDef.slug)
        console.log(`[Badge Unlocked] ${userId}: ${badgeDef.slug}`)
      }
    }

    return unlockedBadges
  } catch (error) {
    console.error("[Badge Check Error]", error)
    return []
  }
}

/**
 * Hole alle freigeschalteten Badges für User
 */
export async function getUserBadges(userId: string) {
  try {
    const db = getDatabase()

    const userBadgesRecords = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))

    const badgeDefs = userBadgesRecords
      .map((ub) => {
        return BADGE_DEFINITIONS.find(
          (bd) => `badge-${bd.slug}` === ub.badgeId
        )
      })
      .filter((bd) => bd !== undefined) as BadgeDefinition[]

    return badgeDefs
  } catch (error) {
    console.error("[Get User Badges Error]", error)
    return []
  }
}
