/**
 * Phase 8A: Learning Strategy Analyzer
 * Tracks which learning strategies work best for the user
 */

import { getDatabase } from "@/lib/db/connection"
import { learningStrategyStats } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { LearningStrategy, StrategyEffectiveness, MIN_DATA_POINTS } from "./types"

export async function recordStrategyUse(
  userId: string,
  strategy: LearningStrategy,
  context: {
    topicId?: string
    foundationId?: string
    errorType?: string
    immediateSuccess: boolean
    delayedSuccess?: boolean
    transferSuccess?: boolean
  }
): Promise<void> {
  const db = getDatabase()

  // Find existing record
  const existing = await db
    .select()
    .from(learningStrategyStats)
    .where(
      and(
        eq(learningStrategyStats.userId, userId),
        eq(learningStrategyStats.strategy, strategy),
        context.topicId ? eq(learningStrategyStats.topicId, context.topicId) : undefined,
        context.foundationId
          ? eq(learningStrategyStats.foundationId, context.foundationId)
          : undefined,
        context.errorType ? eq(learningStrategyStats.errorType, context.errorType) : undefined
      )
    )
    .limit(1)

  const now = new Date().toISOString()
  const usageCount = (existing[0]?.usageCount || 0) + 1
  const immediateSuccessCount =
    (existing[0]?.immediateSuccessCount || 0) + (context.immediateSuccess ? 1 : 0)
  const delayedSuccessCount =
    (existing[0]?.delayedSuccessCount || 0) + (context.delayedSuccess ? 1 : 0)
  const transferSuccessCount =
    (existing[0]?.transferSuccessCount || 0) + (context.transferSuccess ? 1 : 0)

  // Calculate effectiveness: weighted average favoring transfer > delayed > immediate
  const effectiveness = calculateEffectiveness(
    immediateSuccessCount,
    delayedSuccessCount,
    transferSuccessCount,
    usageCount
  )

  // Calculate confidence based on data points
  const confidence = calculateConfidence(usageCount)

  if (existing.length > 0) {
    // Update existing
    await db
      .update(learningStrategyStats)
      .set({
        usageCount,
        immediateSuccessCount,
        delayedSuccessCount,
        transferSuccessCount,
        effectiveness,
        confidence,
        lastUsedAt: now,
        updatedAt: now,
      })
      .where(eq(learningStrategyStats.id, existing[0].id))
  } else {
    // Create new
    await db.insert(learningStrategyStats).values({
      id: `${userId}-${strategy}-${Date.now()}`,
      userId,
      strategy,
      topicId: context.topicId,
      foundationId: context.foundationId,
      errorType: context.errorType,
      usageCount,
      immediateSuccessCount,
      delayedSuccessCount,
      transferSuccessCount,
      effectiveness,
      confidence,
      lastUsedAt: now,
      updatedAt: now,
    })
  }
}

export async function getStrategyEffectiveness(
  userId: string,
  strategy?: LearningStrategy,
  topicId?: string
): Promise<StrategyEffectiveness[]> {
  const db = getDatabase()

  const conditions = [eq(learningStrategyStats.userId, userId)]
  if (strategy) conditions.push(eq(learningStrategyStats.strategy, strategy))
  if (topicId) conditions.push(eq(learningStrategyStats.topicId, topicId))

  const records = await db
    .select()
    .from(learningStrategyStats)
    .where(and(...conditions))

  return records.map((r) => ({
    strategy: r.strategy as LearningStrategy,
    topicId: r.topicId || undefined,
    foundationId: r.foundationId || undefined,
    errorType: r.errorType || undefined,
    usageCount: r.usageCount || 0,
    immediateSuccessCount: r.immediateSuccessCount || 0,
    delayedSuccessCount: r.delayedSuccessCount || 0,
    transferSuccessCount: r.transferSuccessCount || 0,
    effectiveness: r.effectiveness || 0,
    confidence: r.confidence || 0,
    lastUsedAt: r.lastUsedAt ? new Date(r.lastUsedAt) : undefined,
  }))
}

export async function getBestStrategyForContext(
  userId: string,
  context: {
    topic?: string
    foundation?: string
    errorType?: string
  }
): Promise<LearningStrategy | null> {
  const strategies = await getStrategyEffectiveness(userId)

  // Filter by context if provided
  let contextual = strategies
  if (context.topic) {
    contextual = contextual.filter((s) => !s.topicId || s.topicId === context.topic)
  }
  if (context.errorType) {
    contextual = contextual.filter((s) => !s.errorType || s.errorType === context.errorType)
  }

  // Sort by effectiveness, prefer high confidence
  const sorted = contextual
    .filter((s) => s.usageCount >= MIN_DATA_POINTS.MEDIUM)
    .sort((a, b) => {
      const aScore = a.effectiveness * a.confidence
      const bScore = b.effectiveness * b.confidence
      return bScore - aScore
    })

  return sorted.length > 0 ? sorted[0].strategy : null
}

function calculateEffectiveness(
  immediateCount: number,
  delayedCount: number,
  transferCount: number,
  total: number
): number {
  if (total === 0) return 0

  // Weight: transfer (0.5) > delayed (0.3) > immediate (0.2)
  const immediateRate = immediateCount / total
  const delayedRate = delayedCount / total
  const transferRate = transferCount / total

  return immediateRate * 0.2 + delayedRate * 0.3 + transferRate * 0.5
}

function calculateConfidence(usageCount: number): number {
  if (usageCount < MIN_DATA_POINTS.MEDIUM) return 0.3
  if (usageCount < MIN_DATA_POINTS.HIGH) return 0.65
  if (usageCount >= MIN_DATA_POINTS.HIGH * 2) return 0.95
  return 0.8
}
