/**
 * Database Repositories
 *
 * Layer zwischen App und Database
 * Alle Datenzugriffe gehen durch hier
 */

import { eq, and, gt, lt, desc } from "drizzle-orm"
import { getDatabase } from "./connection"
import {
  users,
  skillMastery,
  learningMissions,
  missionBlocks,
  schoolTopicSignals,
  xpSystem,
  schoolTasks,
  taskVariants,
} from "./schema"

// ============= User Repository =============

export const userRepository = {
  async create(id: string, name: string, email?: string) {
    const db = getDatabase()
    return db.insert(users).values({ id, name, email }).returning().get()
  },

  async getById(id: string) {
    const db = getDatabase()
    return db.select().from(users).where(eq(users.id, id)).get()
  },
}

// ============= Skill Mastery Repository =============

export const skillMasteryRepository = {
  async upsert(userId: string, skillName: string, data: any) {
    const db = getDatabase()
    const existing = await db
      .select()
      .from(skillMastery)
      .where(and(eq(skillMastery.userId, userId), eq(skillMastery.skillName, skillName)))
      .get()

    if (existing) {
      return db
        .update(skillMastery)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(skillMastery.id, existing.id))
        .returning()
        .get()
    }

    return db
      .insert(skillMastery)
      .values({
        id: `skill_${userId}_${skillName}_${Date.now()}`,
        userId,
        skillName,
        ...data,
      })
      .returning()
      .get()
  },

  async getByUser(userId: string) {
    const db = getDatabase()
    return db.select().from(skillMastery).where(eq(skillMastery.userId, userId)).all()
  },

  async updateConfidence(skillId: string, confidence: number) {
    const db = getDatabase()
    return db
      .update(skillMastery)
      .set({
        masteryConfidence: confidence,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(skillMastery.id, skillId))
      .returning()
      .get()
  },
}

// ============= School Topic Repository =============

export const schoolTopicRepository = {
  async upsert(userId: string, topicId: string, data: any) {
    const db = getDatabase()
    const existing = await db
      .select()
      .from(schoolTopicSignals)
      .where(and(eq(schoolTopicSignals.userId, userId), eq(schoolTopicSignals.topicId, topicId)))
      .get()

    if (existing) {
      return db
        .update(schoolTopicSignals)
        .set(data)
        .where(eq(schoolTopicSignals.id, existing.id))
        .returning()
        .get()
    }

    return db
      .insert(schoolTopicSignals)
      .values({
        id: `topic_${userId}_${topicId}_${Date.now()}`,
        userId,
        topicId,
        ...data,
      })
      .returning()
      .get()
  },

  async getByUser(userId: string) {
    const db = getDatabase()
    return db
      .select()
      .from(schoolTopicSignals)
      .where(eq(schoolTopicSignals.userId, userId))
      .orderBy(desc(schoolTopicSignals.relevanceScore))
      .all()
  },
}

// ============= Mission Repository =============

export const missionRepository = {
  async create(userId: string, data: any) {
    const db = getDatabase()
    return db.insert(learningMissions).values({ userId, ...data }).returning().get()
  },

  async getToday(userId: string) {
    const db = getDatabase()
    const today = new Date().toISOString().split("T")[0]
    return db
      .select()
      .from(learningMissions)
      .where(and(eq(learningMissions.userId, userId), eq(learningMissions.date, today)))
      .get()
  },

  async update(missionId: string, data: any) {
    const db = getDatabase()
    return db
      .update(learningMissions)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(learningMissions.id, missionId))
      .returning()
      .get()
  },

  async getWithBlocks(missionId: string) {
    const db = getDatabase()
    const mission = await db
      .select()
      .from(learningMissions)
      .where(eq(learningMissions.id, missionId))
      .get()

    if (!mission) return null

    const blocks = await db
      .select()
      .from(missionBlocks)
      .where(eq(missionBlocks.missionId, missionId))
      .orderBy(missionBlocks.blockOrder)
      .all()

    return { mission, blocks }
  },
}

// ============= Mission Block Repository =============

export const missionBlockRepository = {
  async create(missionId: string, data: any) {
    const db = getDatabase()
    return db.insert(missionBlocks).values({ missionId, ...data }).returning().get()
  },

  async updateStatus(blockId: string, status: string) {
    const db = getDatabase()
    return db
      .update(missionBlocks)
      .set({ blockStatus: status })
      .where(eq(missionBlocks.id, blockId))
      .returning()
      .get()
  },
}

// ============= XP System Repository =============

export const xpRepository = {
  async getOrCreate(userId: string) {
    const db = getDatabase()
    let record = await db.select().from(xpSystem).where(eq(xpSystem.userId, userId)).get()

    if (!record) {
      record = await db
        .insert(xpSystem)
        .values({
          id: `xp_${userId}`,
          userId,
        })
        .returning()
        .get()
    }

    return record
  },

  async addXp(userId: string, amount: number) {
    const db = getDatabase()
    const record = await this.getOrCreate(userId)

    const newTotal = (record?.totalXp || 0) + amount
    const newLevel = Math.floor(newTotal / 500)

    return db
      .update(xpSystem)
      .set({
        totalXp: newTotal,
        currentLevel: newLevel,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(xpSystem.userId, userId))
      .returning()
      .get()
  },

  async addStreak(userId: string) {
    const db = getDatabase()
    const record = await this.getOrCreate(userId)
    const today = new Date().toISOString().split("T")[0]
    const lastStreakDate = record?.lastStreakDate

    let newStreak = 1
    if (lastStreakDate) {
      const lastDate = new Date(lastStreakDate)
      const todayDate = new Date(today)
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        newStreak = (record?.currentStreak || 0) + 1
      } else if (diffDays > 1) {
        newStreak = 1
      } else {
        // Same day, don't increase
        newStreak = record?.currentStreak || 1
      }
    }

    const bestStreak = Math.max(newStreak, record?.bestStreak || 0)

    return db
      .update(xpSystem)
      .set({
        currentStreak: newStreak,
        bestStreak,
        lastStreakDate: today,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(xpSystem.userId, userId))
      .returning()
      .get()
  },
}

// ============= School Tasks Repository =============

export const schoolTaskRepository = {
  async create(userId: string, data: any) {
    const db = getDatabase()
    return db.insert(schoolTasks).values({ userId, ...data }).returning().get()
  },

  async getByTopic(userId: string, topicId: string) {
    const db = getDatabase()
    return db
      .select()
      .from(schoolTasks)
      .where(and(eq(schoolTasks.userId, userId), eq(schoolTasks.topicId, topicId)))
      .all()
  },

  async incrementUsage(taskId: string) {
    const db = getDatabase()
    const task = await db.select().from(schoolTasks).where(eq(schoolTasks.id, taskId)).get()

    return db
      .update(schoolTasks)
      .set({ usageCount: (task?.usageCount || 0) + 1 })
      .where(eq(schoolTasks.id, taskId))
      .returning()
      .get()
  },
}
