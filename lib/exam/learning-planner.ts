/**
 * Phase 7E: Dynamic Exam Planner
 * 
 * Generates adaptive learning plans based on:
 * - Days until exam
 * - Topic readiness scores
 * - Available learning time
 * 
 * NOT rigid day ranges. Instead: dynamic sequencing based on time constraint
 * Integrates with Phase 5 Daily Mission engine (20-min standard)
 */

import type { TopicReadinessReport, LearningPriority } from "./readiness-engine"

export type ActivityType = "FOUNDATION" | "LEARN" | "PRACTICE" | "MINI_CHECK" | "TRANSFER" | "REVIEW" | "SIMULATION"

export interface ExamPlanDay {
  date: string // ISO
  dayNumber: number // relative to start
  activities: Array<{
    topicId: string
    topicName: string
    activityType: ActivityType
    priority: 1 | 2 | 3 // 1=highest
    estimatedMinutes: number
    reasoning: string
  }>
  totalMinutes: number
  isReviewDay: boolean
}

export interface ExamLearningPlan {
  id: string
  examId: string
  version: number
  status: "ACTIVE" | "SUPERSEDED"
  generatedAt: string
  
  // Plan structure
  startDate: string // ISO
  examDate: string // ISO
  daysUntilExam: number
  
  // Phase breakdown
  phase: {
    foundation?: { days: number; topics: string[] } // repair basics
    intensive?: { days: number; topics: string[] } // heavy practice
    transfer?: { days: number; topics: string[] } // combine concepts
    simulation?: { days: number; topics?: string[] } // practice exam
    review?: { days: number; topics: string[] } // final polish
  }
  
  // Daily schedule
  dailyPlan: ExamPlanDay[]
  
  // Metrics
  totalMinutesNeeded: number
  recommendedDailyMinutes: number
  criticalTopics: string[]
  
  // Adaptability
  lastAdjustedAt?: string
  adjustmentReasons: string[]
}

/**
 * Determine plan phases based on days until exam
 */
function determinePlanPhases(
  daysUntilExam: number,
  criticalCount: number,
  workingCount: number
): string[] {
  const phases: string[] = []

  if (daysUntilExam > 14) {
    // 2+ weeks: full pipeline
    if (criticalCount > 0) phases.push("FOUNDATION")
    phases.push("LEARN", "PRACTICE", "TRANSFER", "REVIEW", "SIMULATION")
  } else if (daysUntilExam > 7) {
    // 1-2 weeks: intensive focus
    if (criticalCount > 0) phases.push("FOUNDATION")
    phases.push("INTENSIVE_PRACTICE", "TRANSFER", "MINI_CHECK", "REVIEW", "SIMULATION")
  } else if (daysUntilExam > 3) {
    // 3-7 days: focus gaps only
    if (criticalCount > 0) phases.push("FOUNDATION_FOCUS")
    phases.push("TRANSFER", "SIMULATION")
  } else {
    // 1-2 days: confidence boost only
    phases.push("CONFIDENCE_REVIEW", "SIMULATION")
  }

  return phases
}

/**
 * Allocate days to phases
 */
function allocateDaysToPhases(
  phases: string[],
  daysUntilExam: number,
  daysForSimulation: number = 2
): Record<string, number> {
  const allocation: Record<string, number> = {}
  const availableDays = daysUntilExam - daysForSimulation

  if (availableDays < 1) {
    return { CONFIDENCE_REVIEW: Math.max(1, daysUntilExam - 1) }
  }

  if (daysUntilExam > 14) {
    allocation.FOUNDATION = 3
    allocation.LEARN = 4
    allocation.PRACTICE = 4
    allocation.TRANSFER = 2
    allocation.REVIEW = Math.max(1, availableDays - 13)
  } else if (daysUntilExam > 7) {
    allocation.FOUNDATION = Math.min(2, Math.ceil(availableDays / 3))
    allocation.INTENSIVE_PRACTICE = Math.ceil(availableDays / 2)
    allocation.TRANSFER = Math.max(1, Math.floor(availableDays / 3))
    allocation.MINI_CHECK = Math.max(1, Math.floor(availableDays / 4))
    allocation.REVIEW = Math.max(1, availableDays - allocation.FOUNDATION - allocation.INTENSIVE_PRACTICE - allocation.TRANSFER)
  } else if (daysUntilExam > 3) {
    allocation.FOUNDATION_FOCUS = Math.ceil(availableDays / 2)
    allocation.TRANSFER = Math.max(1, Math.floor(availableDays / 2))
  } else {
    allocation.CONFIDENCE_REVIEW = availableDays
  }

  allocation.SIMULATION = daysForSimulation

  return allocation
}

/**
 * Generate daily plan items
 */
function generateDailyActivities(
  topicPriorities: LearningPriority[],
  readinessReports: Map<string, TopicReadinessReport>,
  phase: string,
  dayOfPhase: number,
  totalDaysInPhase: number
): Array<{
  topicId: string
  topicName: string
  activityType: ActivityType
  priority: 1 | 2 | 3
  estimatedMinutes: number
  reasoning: string
}> {
  const activities: typeof undefined[] = []

  if (phase === "FOUNDATION" || phase === "FOUNDATION_FOCUS") {
    // Basics first: take top 2-3 critical topics
    const criticalTopics = topicPriorities
      .filter((p) => p.priority === "URGENT")
      .slice(0, 3)

    criticalTopics.forEach((topic, idx) => {
      const report = readinessReports.get(topic.topicId)
      if (report) {
        activities.push({
          topicId: topic.topicId,
          topicName: report.topicName,
          activityType: "FOUNDATION",
          priority: (idx + 1) as 1 | 2 | 3,
          estimatedMinutes: 20,
          reasoning: `Grundlagen reparieren (Score: ${report.readinessScore}%)`,
        })
      }
    })
  } else if (phase === "LEARN") {
    // New concept introduction
    const newTopics = topicPriorities
      .filter((p) => p.priority === "HIGH" || p.priority === "URGENT")
      .slice(0, 2)

    newTopics.forEach((topic, idx) => {
      const report = readinessReports.get(topic.topicId)
      if (report) {
        activities.push({
          topicId: topic.topicId,
          topicName: report.topicName,
          activityType: "LEARN",
          priority: (idx + 1) as 1 | 2 | 3,
          estimatedMinutes: 15,
          reasoning: `Neue Konzepte einführen (ELI teaches inline)`,
        })
      }
    })
  } else if (phase === "PRACTICE" || phase === "INTENSIVE_PRACTICE") {
    // Solid practice
    const practiceTopics = topicPriorities.slice(0, 2)

    practiceTopics.forEach((topic, idx) => {
      const report = readinessReports.get(topic.topicId)
      if (report) {
        activities.push({
          topicId: topic.topicId,
          topicName: report.topicName,
          activityType: "PRACTICE",
          priority: (idx + 1) as 1 | 2 | 3,
          estimatedMinutes: 20,
          reasoning: `Übungsaufgaben (${report.readinessLevel})`,
        })
      }
    })
  } else if (phase === "MINI_CHECK") {
    // Assess understanding
    const topicsToCheck = topicPriorities.slice(0, 2)

    topicsToCheck.forEach((topic, idx) => {
      const report = readinessReports.get(topic.topicId)
      if (report) {
        activities.push({
          topicId: topic.topicId,
          topicName: report.topicName,
          activityType: "MINI_CHECK",
          priority: (idx + 1) as 1 | 2 | 3,
          estimatedMinutes: 10,
          reasoning: `Selbst-Test: Kann ich das?`,
        })
      }
    })
  } else if (phase === "TRANSFER") {
    // Combine concepts
    const topics = topicPriorities.slice(0, 2)
    if (topics.length >= 2) {
      activities.push({
        topicId: `${topics[0].topicId}-${topics[1].topicId}`,
        topicName: `${readinessReports.get(topics[0].topicId)?.topicName || topics[0].topicId} + ${readinessReports.get(topics[1].topicId)?.topicName || topics[1].topicId}`,
        activityType: "TRANSFER",
        priority: 1,
        estimatedMinutes: 20,
        reasoning: `Konzepte kombinieren`,
      })
    }
  } else if (phase === "REVIEW" || phase === "CONFIDENCE_REVIEW") {
    // Spaced repetition of weak areas
    const weakTopics = topicPriorities
      .filter((p) => p.priority === "URGENT" || p.priority === "HIGH")
      .slice(0, 2)

    weakTopics.forEach((topic, idx) => {
      const report = readinessReports.get(topic.topicId)
      if (report) {
        activities.push({
          topicId: topic.topicId,
          topicName: report.topicName,
          activityType: "REVIEW",
          priority: (idx + 1) as 1 | 2 | 3,
          estimatedMinutes: 15,
          reasoning: `Wiederholung (Spaced Repetition)`,
        })
      }
    })
  } else if (phase === "SIMULATION") {
    activities.push({
      topicId: "practice-exam",
      topicName: "Probe-Klassenarbeit",
      activityType: "SIMULATION",
      priority: 1,
      estimatedMinutes: 60,
      reasoning: `Realistischer Full-Length Test`,
    })
  }

  return activities
}

/**
 * Generate complete learning plan
 */
export function generateExamLearningPlan(
  examId: string,
  topicPriorities: LearningPriority[],
  readinessReports: TopicReadinessReport[],
  daysUntilExam: number
): ExamLearningPlan {
  const today = new Date()
  const examDate = new Date(today.getTime() + daysUntilExam * 24 * 60 * 60 * 1000)

  // Map readiness reports by topicId for quick lookup
  const reportMap = new Map(
    readinessReports.map((r) => [r.topicId, r])
  )

  const criticalCount = topicPriorities.filter(
    (p) => p.priority === "URGENT"
  ).length
  const workingCount = topicPriorities.filter(
    (p) => p.priority === "HIGH" || p.priority === "MEDIUM"
  ).length

  // Determine plan phases
  const phases = determinePlanPhases(daysUntilExam, criticalCount, workingCount)
  const phaseAllocation = allocateDaysToPhases(phases, daysUntilExam)

  // Generate daily plan
  const dailyPlan: ExamPlanDay[] = []
  let dayNumber = 0

  Object.entries(phaseAllocation).forEach(([phaseName, phaseDays]) => {
    for (let dayOfPhase = 1; dayOfPhase <= phaseDays; dayOfPhase++) {
      dayNumber++
      const date = new Date(today.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000)

      const activities = generateDailyActivities(
        topicPriorities,
        reportMap,
        phaseName,
        dayOfPhase,
        phaseDays
      )

      const totalMinutes = activities.reduce((sum, a) => sum + a.estimatedMinutes, 0)

      dailyPlan.push({
        date: date.toISOString().split("T")[0],
        dayNumber,
        activities,
        totalMinutes,
        isReviewDay: phaseName === "REVIEW" || phaseName === "CONFIDENCE_REVIEW",
      })
    }
  })

  const totalMinutes = readinessReports.reduce(
    (sum, r) => sum + r.estimatedMinutesNeeded,
    0
  )

  return {
    id: `plan-${examId}-${Date.now()}`,
    examId,
    version: 1,
    status: "ACTIVE",
    generatedAt: new Date().toISOString(),
    startDate: today.toISOString().split("T")[0],
    examDate: examDate.toISOString().split("T")[0],
    daysUntilExam,
    phase: {
      foundation: phaseAllocation.FOUNDATION
        ? {
            days: phaseAllocation.FOUNDATION,
            topics: topicPriorities
              .filter((p) => p.priority === "URGENT")
              .map((p) => p.topicId)
              .slice(0, 3),
          }
        : undefined,
      intensive: phaseAllocation.INTENSIVE_PRACTICE
        ? {
            days: phaseAllocation.INTENSIVE_PRACTICE,
            topics: topicPriorities
              .filter((p) => p.priority === "HIGH" || p.priority === "URGENT")
              .map((p) => p.topicId)
              .slice(0, 5),
          }
        : undefined,
      transfer: phaseAllocation.TRANSFER
        ? {
            days: phaseAllocation.TRANSFER,
            topics: topicPriorities.map((p) => p.topicId).slice(0, 4),
          }
        : undefined,
      simulation: phaseAllocation.SIMULATION
        ? {
            days: phaseAllocation.SIMULATION,
            topics: topicPriorities.map((p) => p.topicId),
          }
        : undefined,
      review: phaseAllocation.REVIEW
        ? {
            days: phaseAllocation.REVIEW,
            topics: topicPriorities
              .filter((p) => p.priority === "URGENT" || p.priority === "HIGH")
              .map((p) => p.topicId),
          }
        : undefined,
    },
    dailyPlan,
    totalMinutesNeeded: totalMinutes,
    recommendedDailyMinutes: Math.round(totalMinutes / daysUntilExam),
    criticalTopics: topicPriorities
      .filter((p) => p.priority === "URGENT")
      .map((p) => p.topicId),
    adjustmentReasons: [],
  }
}

/**
 * Check if plan needs adjustment (called after Mini-Check, Transfer, etc.)
 */
export function shouldAdjustPlan(
  currentPlan: ExamLearningPlan,
  changeEvent: {
    type: "MINI_CHECK_RESULT" | "TRANSFER_RESULT" | "FOUNDATION_CLOSED" | "MASTERY_CHANGE"
    topicId: string
    newScore?: number
  }
): boolean {
  const daysSinceGenerated = Math.floor(
    (Date.now() - new Date(currentPlan.generatedAt).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  // Adjust if significant progress or regression detected
  if (changeEvent.type === "MINI_CHECK_RESULT" && changeEvent.newScore !== undefined) {
    // Score change > 15% warrants re-plan
    return Math.abs(changeEvent.newScore - 70) > 15
  }

  // Adjust if foundation gap closed
  if (changeEvent.type === "FOUNDATION_CLOSED") {
    return true
  }

  // Adjust every 3-4 days or on major events
  return daysSinceGenerated > 3
}
