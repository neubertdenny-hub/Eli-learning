import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/connection"
import { adaptiveDecisions, learningStrategyStats } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const db = getDatabase()
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"

    // 1. Get recent adaptive decisions
    const decisions = await db
      .select()
      .from(adaptiveDecisions)
      .where(eq(adaptiveDecisions.userId, userId))
      .limit(20)

    // 2. Get strategy stats
    const strategies = await db
      .select()
      .from(learningStrategyStats)
      .where(eq(learningStrategyStats.userId, userId))

    // 3. Calculate summary stats
    const totalDecisions = decisions.length
    const avgConfidence =
      decisions.length > 0
        ? decisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / decisions.length
        : 0

    const strategyEffectiveness = strategies.map((s) => ({
      strategy: s.strategy,
      effectiveness: s.effectiveness || 0,
      confidence: s.confidence || 0,
      usageCount: s.usageCount || 0,
      lastUsed: s.lastUsedAt,
    }))

    return NextResponse.json({
      success: true,
      monitoring: {
        userId,
        totalDecisions,
        avgConfidence: parseFloat(avgConfidence.toFixed(2)),
        recentDecisions: decisions.map((d) => ({
          taskId: d.taskId,
          strategy: d.selectedStrategy,
          helpLevel: d.selectedHelpLevel,
          confidence: d.confidence,
          reasonCodes: d.reasonCodes ? JSON.parse(d.reasonCodes) : [],
          timestamp: d.createdAt,
        })),
        strategyEffectiveness: strategyEffectiveness.sort(
          (a, b) => (b.effectiveness || 0) - (a.effectiveness || 0)
        ),
        summary: {
          topStrategy: strategyEffectiveness.length > 0 ? strategyEffectiveness[0]?.strategy : "N/A",
          readyForActivation: avgConfidence >= 0.7 && totalDecisions >= 50,
          qualityAssessment:
            avgConfidence >= 0.75 ? "GOOD" : avgConfidence >= 0.6 ? "FAIR" : "NEEDS_WORK",
        },
      },
    })
  } catch (error) {
    console.error("[Monitoring API Error]", error)
    return NextResponse.json(
      { error: "Failed to fetch monitoring data", success: false },
      { status: 500 }
    )
  }
}
