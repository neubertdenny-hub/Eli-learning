/**
 * Phase 7D: Readiness Engine (REVISED)
 * 
 * Analyzes student knowledge state using Phase 4/5 Mastery Data
 * NOT a new mastery calculation - orchestrates existing data
 * 
 * Sources:
 * - Phase 5 Mastery Confidence Scores
 * - Mini-Check Results
 * - Transfer Task Success
 * - Help Level Trends
 * - Self-Correction Rate
 * - Error Pattern Analysis
 */

export interface TopicReadinessReport {
  topicId: string
  topicName: string
  // Core Readiness (0-100)
  readinessScore: number
  readinessLevel: "READY" | "WORKING" | "FOUNDATION"
  
  // Evidence (from Phase 4/5)
  independentSuccessRate: number // % tasks done w/o help
  miniCheckScore?: number // last mini-check %
  transferSuccess?: number // % of transfer tasks passed
  averageHelpLevel: number // 1-4, trend improving?
  selfCorrectionRate: number // % self-corrected errors
  lastSuccessDate: string // ISO, how recent?
  
  // Gaps & Recommendations
  gaps: string[] // specific weak areas
  recommendations: string[] // what to practice
  estimatedMinutesNeeded: number // realistic time
  changesSinceLastCheck: string // what improved/declined
  
  // Explainability (for Parent Dashboard)
  reasoning: {
    factors: Array<{
      name: string
      value: number // -50 to +50 impact
      reason: string
    }>
    overallScore: string // natural language summary
  }
}

export interface ReadinessAnalysis {
  totalTopics: number
  readyTopics: number
  workingTopics: number
  foundationTopics: number
  overallReadiness: number // 0-100
  
  criticalTopics: TopicReadinessReport[] // foundation issues
  strongTopics: TopicReadinessReport[] // ready to transfer
  
  totalMinutesNeeded: number
  recommendedDailyMinutes: number
  estimatedCompletionDate: string
}

export interface LearningPriority {
  topicId: string
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW"
  daysUntilExam: number
  minutesPerDay: number
  
  // Why this priority?
  reasoning: {
    readinessGap: number // how far from 100?
    timeConstraint: string // days left vs time needed
    criticality: string // foundation? exam-critical?
    trendAnalysis: string // improving or declining?
  }
}

/**
 * TODO: Replace with real database query to Phase 5 Mastery data
 * For now: Mock data structure
 */
function getMasteryDataForTopic(topicId: string, userId?: string): any {
  // Query Phase 5 mastery table:
  // SELECT * FROM topic_mastery WHERE topicId = ? AND userId = ?
  
  // Mock fallback (DELETE in production)
  return {
    topicId,
    confidenceScore: 0.65, // from Phase 5
    independentSuccessRate: 0.60,
    taskCount: 8,
    tasksPassed: 5,
    averageScore: 72,
    lastAttempt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    helpLevelTrend: "improving", // improving, stable, declining
    miniCheckScores: [65, 72], // last 2 attempts
    transferTaskResults: { attempted: 2, passed: 1 },
    selfCorrectionCount: 3,
    errorPatterns: ["Vorzeichenfehler", "Umwandlung übersehen"],
  }
}

/**
 * Map Phase 5 Mastery Data to Readiness Score (0-100)
 * Heavy emphasis on INDEPENDENT success (no help)
 */
function calculateReadinessScore(masteryData: any): {
  score: number
  factors: Array<{ name: string; value: number; reason: string }>
} {
  const factors: Array<{ name: string; value: number; reason: string }> = []
  let score = 0

  // Factor 1: Independent Success Rate (0-40 points)
  const indScore = (masteryData.independentSuccessRate || 0) * 40
  factors.push({
    name: "Independent Success",
    value: indScore,
    reason: `${Math.round((masteryData.independentSuccessRate || 0) * 100)}% tasks w/o help`,
  })
  score += indScore

  // Factor 2: Mini-Check Performance (0-30 points)
  const miniChecks = masteryData.miniCheckScores || []
  const recentMiniCheck = miniChecks[miniChecks.length - 1]
  if (recentMiniCheck) {
    const miniCheckScore = (recentMiniCheck / 100) * 30
    factors.push({
      name: "Mini-Check Result",
      value: miniCheckScore,
      reason: `Last: ${recentMiniCheck}%`,
    })
    score += miniCheckScore
  }

  // Factor 3: Transfer Success (0-20 points)
  if (masteryData.transferTaskResults) {
    const { attempted, passed } = masteryData.transferTaskResults
    if (attempted > 0) {
      const transferScore = (passed / attempted) * 20
      factors.push({
        name: "Transfer Success",
        value: transferScore,
        reason: `${passed}/${attempted} transfer tasks passed`,
      })
      score += transferScore
    }
  }

  // Factor 4: Help Level Trend (±10 points)
  const helpLevelMap = { improving: 10, stable: 0, declining: -10 }
  const helpFactor = helpLevelMap[masteryData.helpLevelTrend as keyof typeof helpLevelMap] || 0
  factors.push({
    name: "Help Level Trend",
    value: helpFactor,
    reason: masteryData.helpLevelTrend,
  })
  score += helpFactor

  // Factor 5: Self-Correction Rate (±10 points)
  const selfCorrectionBonus =
    (masteryData.selfCorrectionCount || 0) > 2 ? 10 : -5
  factors.push({
    name: "Self-Correction",
    value: selfCorrectionBonus,
    reason: `${masteryData.selfCorrectionCount || 0} self-corrections`,
  })
  score += selfCorrectionBonus

  // Cap at 100
  const finalScore = Math.min(100, Math.max(0, Math.round(score)))

  return { score: finalScore, factors }
}

/**
 * Determine readiness level
 */
function determineReadinessLevel(
  score: number
): "READY" | "WORKING" | "FOUNDATION" {
  if (score >= 80) return "READY"
  if (score >= 50) return "WORKING"
  return "FOUNDATION"
}

/**
 * Analyze a single topic's readiness
 */
export function analyzeTopicReadiness(
  topicId: string,
  topicName: string,
  userId?: string
): TopicReadinessReport {
  const masteryData = getMasteryDataForTopic(topicId, userId)
  const { score: readinessScore, factors } = calculateReadinessScore(
    masteryData
  )
  const readinessLevel = determineReadinessLevel(readinessScore)

  // Time estimate based on readiness
  const timeEstimates = {
    READY: 30, // review only
    WORKING: 120, // practice + review
    FOUNDATION: 240, // learn + practice + review
  }

  // Identify specific gaps
  const gaps: string[] = []
  if (masteryData.errorPatterns?.length > 0) {
    gaps.push(
      `Häufige Fehler: ${masteryData.errorPatterns.slice(0, 2).join(", ")}`
    )
  }
  if (masteryData.helpLevelTrend === "declining") {
    gaps.push("Bedarf mehr Hilfe → Grundlagen prüfen")
  }
  if (readinessScore < 60 && !masteryData.miniCheckScores?.length) {
    gaps.push("Noch nicht geprüft mit Mini-Check")
  }

  const recommendations: string[] = []
  if (readinessLevel === "FOUNDATION") {
    recommendations.push("Grund-Übungen wiederholen")
    recommendations.push("Einzelne Fehler systematisch üben")
  } else if (readinessLevel === "WORKING") {
    recommendations.push("Mehr eigenständige Aufgaben")
    recommendations.push("Transfer-Aufgaben probieren")
  } else {
    recommendations.push("Schwierigere Aufgaben zum Vertiefen")
    recommendations.push("Transfer-Aufgaben optimal nutzen")
  }

  const lastAttempt = masteryData.lastAttempt
    ? new Date(masteryData.lastAttempt)
    : null
  const daysSinceAttempt = lastAttempt
    ? Math.floor(
        (Date.now() - lastAttempt.getTime()) / (1000 * 60 * 60 * 24)
      )
    : null

  return {
    topicId,
    topicName,
    readinessScore,
    readinessLevel,
    independentSuccessRate: masteryData.independentSuccessRate || 0,
    miniCheckScore: masteryData.miniCheckScores?.[masteryData.miniCheckScores.length - 1],
    transferSuccess: masteryData.transferTaskResults
      ? (masteryData.transferTaskResults.passed /
          masteryData.transferTaskResults.attempted) *
        100
      : undefined,
    averageHelpLevel: masteryData.averageHelpLevel || 2.5,
    selfCorrectionRate:
      masteryData.selfCorrectionCount > 0 ? 0.3 : 0.1,
    lastSuccessDate: lastAttempt?.toISOString() || new Date().toISOString(),
    gaps: gaps.length > 0 ? gaps : ["Stabil"],
    recommendations,
    estimatedMinutesNeeded:
      timeEstimates[readinessLevel as keyof typeof timeEstimates],
    changesSinceLastCheck:
      masteryData.helpLevelTrend === "improving"
        ? "↗ Trend positiv"
        : masteryData.helpLevelTrend === "declining"
          ? "↘ Trend negativ"
          : "→ Stabil",
    reasoning: {
      factors,
      overallScore: `${readinessLevel === "READY" ? "✅" : readinessLevel === "WORKING" ? "🟡" : "🔴"} ${readinessScore}%: ${readinessLevel === "READY" ? "Gut vorbereitet" : readinessLevel === "WORKING" ? "Verbesserungspotential" : "Grundlagen brauchen Fokus"}`,
    },
  }
}

/**
 * Generate readiness analysis for all exam topics
 */
export function generateReadinessReport(
  examTopics: Array<{ topicId: string; topicName: string }>,
  userId?: string
): ReadinessAnalysis {
  const reports = examTopics.map((t) =>
    analyzeTopicReadiness(t.topicId, t.topicName, userId)
  )

  const ready = reports.filter((r) => r.readinessLevel === "READY")
  const working = reports.filter((r) => r.readinessLevel === "WORKING")
  const foundation = reports.filter((r) => r.readinessLevel === "FOUNDATION")

  const overallReadiness = Math.round(
    reports.reduce((sum, r) => sum + r.readinessScore, 0) / reports.length
  )

  const totalMinutes = reports.reduce(
    (sum, r) => sum + r.estimatedMinutesNeeded,
    0
  )

  return {
    totalTopics: reports.length,
    readyTopics: ready.length,
    workingTopics: working.length,
    foundationTopics: foundation.length,
    overallReadiness,
    criticalTopics: foundation.sort((a, b) => a.readinessScore - b.readinessScore),
    strongTopics: ready.sort((a, b) => b.readinessScore - a.readinessScore),
    totalMinutesNeeded: totalMinutes,
    recommendedDailyMinutes: Math.round(totalMinutes / 14), // assume 2 weeks
    estimatedCompletionDate: new Date(
      Date.now() + totalMinutes * 60 * 1000
    ).toISOString(),
  }
}

/**
 * Calculate learning priority based on readiness + time constraint
 */
export function calculateLearningPriority(
  topicReport: TopicReadinessReport,
  daysUntilExam: number
): LearningPriority {
  const readinessGap = 100 - topicReport.readinessScore
  const minutesPerDay = Math.ceil(
    topicReport.estimatedMinutesNeeded / daysUntilExam
  )

  let priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW"
  let timeConstraint = ""
  let criticality = ""

  if (topicReport.readinessLevel === "FOUNDATION") {
    priority = "URGENT"
    criticality = "Grundlagen kritisch"
    timeConstraint = `${minutesPerDay} min/Tag nötig`
  } else if (topicReport.readinessLevel === "WORKING") {
    if (minutesPerDay > 45) {
      priority = "HIGH"
      timeConstraint = `${minutesPerDay} min/Tag empfohlen`
    } else {
      priority = "MEDIUM"
      timeConstraint = `${minutesPerDay} min/Tag ausreichend`
    }
    criticality = "Verbesserungspotential"
  } else {
    priority = daysUntilExam < 7 ? "MEDIUM" : "LOW"
    criticality = "Gut vorbereitet"
    timeConstraint =
      daysUntilExam < 7
        ? "Review vor Exam"
        : "Optional Vertiefung"
  }

  return {
    topicId: topicReport.topicId,
    priority,
    daysUntilExam,
    minutesPerDay,
    reasoning: {
      readinessGap,
      timeConstraint,
      criticality,
      trendAnalysis: topicReport.changesSinceLastCheck,
    },
  }
}
