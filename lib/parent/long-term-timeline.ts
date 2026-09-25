/**
 * Phase 9C: Long-Term Learning Timeline
 * Tracks development across 7-day, 21-day, 3-month, yearly periods
 */

export type TimelineRange = "7day" | "21day" | "3month" | "1year"

export interface TimelineSnapshot {
  date: Date
  independentSuccessRate: number
  averageHelpLevel: number
  transferSuccessRate: number
  reviewRetentionRate: number
  activeLearningMinutes: number
  foundationGapCount: number
  topicsMastered: number
}

export interface TimelineComparison {
  range: TimelineRange
  periodStart: Date
  periodEnd: Date
  snapshots: TimelineSnapshot[]
  metrics: {
    independentSuccessChange: number // percent change
    helpLevelChange: number
    transferSuccessChange: number
    retentionChange: number
    activeLearningTotalMinutes: number
    gapsClosedCount: number
    topicsMasteredCount: number
  }
  trend: "improving" | "stable" | "declining"
  confidence: "LOW" | "MEDIUM" | "HIGH"
  keyObservations: string[]
}

/**
 * Generate timeline for period
 */
export async function generateTimeline(
  userId: string,
  range: TimelineRange
): Promise<TimelineComparison> {
  // Calculate date range
  const now = new Date()
  const periodStart = new Date(now)
  let periodEnd = new Date(now)

  switch (range) {
    case "7day":
      periodStart.setDate(now.getDate() - 7)
      break
    case "21day":
      periodStart.setDate(now.getDate() - 21)
      break
    case "3month":
      periodStart.setMonth(now.getMonth() - 3)
      break
    case "1year":
      periodStart.setFullYear(now.getFullYear() - 1)
      break
  }

  // Generate placeholder snapshots (in real impl: from DB)
  const snapshots = generateSnapshotsForRange(range)

  // Calculate metrics
  const metrics = calculateTimelineMetrics(snapshots)

  // Determine trend
  const trend = determineTrend(snapshots)

  // Generate observations
  const observations = generateObservations(metrics, trend)

  return {
    range,
    periodStart,
    periodEnd,
    snapshots,
    metrics,
    trend,
    confidence: snapshots.length > 5 ? "HIGH" : "MEDIUM",
    keyObservations: observations,
  }
}

function generateSnapshotsForRange(range: TimelineRange): TimelineSnapshot[] {
  // Simulate realistic learning curve
  const baseDate = new Date()
  const count = range === "7day" ? 7 : range === "21day" ? 21 : range === "3month" ? 13 : 52

  const snapshots: TimelineSnapshot[] = []

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate)
    if (range === "7day") date.setDate(date.getDate() - (7 - i))
    else if (range === "21day") date.setDate(date.getDate() - (21 - i))
    else if (range === "3month") date.setDate(date.getDate() - (13 - i) * 7)
    else date.setDate(date.getDate() - (52 - i) * 7)

    // Simulate upward trend
    const progress = i / count
    snapshots.push({
      date,
      independentSuccessRate: 0.45 + progress * 0.25,
      averageHelpLevel: 2.0 - progress * 0.6,
      transferSuccessRate: 0.35 + progress * 0.3,
      reviewRetentionRate: 0.55 + progress * 0.2,
      activeLearningMinutes: 80 + Math.random() * 50,
      foundationGapCount: Math.max(0, 5 - Math.floor(progress * 4)),
      topicsMastered: Math.floor(progress * 8),
    })
  }

  return snapshots
}

function calculateTimelineMetrics(snapshots: TimelineSnapshot[]): any {
  if (snapshots.length < 2) {
    return {
      independentSuccessChange: 0,
      helpLevelChange: 0,
      transferSuccessChange: 0,
      retentionChange: 0,
      activeLearningTotalMinutes: 0,
      gapsClosedCount: 0,
      topicsMasteredCount: 0,
    }
  }

  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]

  return {
    independentSuccessChange: Math.round((last.independentSuccessRate - first.independentSuccessRate) * 100),
    helpLevelChange: -(last.averageHelpLevel - first.averageHelpLevel).toFixed(1),
    transferSuccessChange: Math.round((last.transferSuccessRate - first.transferSuccessRate) * 100),
    retentionChange: Math.round((last.reviewRetentionRate - first.reviewRetentionRate) * 100),
    activeLearningTotalMinutes: Math.round(snapshots.reduce((sum, s) => sum + s.activeLearningMinutes, 0)),
    gapsClosedCount: first.foundationGapCount - last.foundationGapCount,
    topicsMasteredCount: last.topicsMastered - first.topicsMastered,
  }
}

function determineTrend(snapshots: TimelineSnapshot[]): "improving" | "stable" | "declining" {
  if (snapshots.length < 2) return "stable"

  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]

  const successDelta = last.independentSuccessRate - first.independentSuccessRate
  const helpDelta = last.averageHelpLevel - first.averageHelpLevel

  if (successDelta > 0.1 || helpDelta < -0.3) return "improving"
  if (successDelta < -0.1 || helpDelta > 0.3) return "declining"
  return "stable"
}

function generateObservations(metrics: any, trend: string): string[] {
  const obs: string[] = []

  if (metrics.independentSuccessChange > 10) {
    obs.push(`Selbstständigkeit +${metrics.independentSuccessChange}%`)
  }

  if (metrics.gapsClosedCount > 0) {
    obs.push(`${metrics.gapsClosedCount} Grundlagen geklärt`)
  }

  if (metrics.topicsMasteredCount > 0) {
    obs.push(`${metrics.topicsMasteredCount} Themen gemeistert`)
  }

  if (metrics.transferSuccessChange > 15) {
    obs.push("Transfer deutlich besser")
  }

  if (trend === "improving") {
    obs.push("Aufwärts-Trend")
  }

  return obs.slice(0, 4)
}
