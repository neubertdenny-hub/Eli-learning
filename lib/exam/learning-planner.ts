/**
 * Phase 7E: Dynamic Exam Planner
 * Generates adaptive learning plans based on daysUntilExam + readiness
 */

export type ActivityType = "FOUNDATION" | "LEARN" | "PRACTICE" | "MINI_CHECK" | "TRANSFER" | "REVIEW" | "SIMULATION"

export interface Activity {
  topicId: string
  topicName: string
  activityType: ActivityType
  priority: 1 | 2 | 3
  estimatedMinutes: number
  reasoning: string
}

export interface ExamPlanDay {
  date: string
  dayNumber: number
  activities: Activity[]
  totalMinutes: number
  isReviewDay: boolean
}

export interface ExamLearningPlan {
  id: string
  examId: string
  version: number
  status: "ACTIVE" | "SUPERSEDED"
  generatedAt: string
  startDate: string
  examDate: string
  daysUntilExam: number
  phase: Record<string, { days: number; topics: string[] } | undefined>
  dailyPlan: ExamPlanDay[]
  totalMinutesNeeded: number
  recommendedDailyMinutes: number
  criticalTopics: string[]
  adjustmentReasons: string[]
}

import type { TopicReadinessReport, LearningPriority } from "./readiness-engine"

function determinePlanPhases(
  daysUntilExam: number,
  criticalCount: number
): string[] {
  const phases: string[] = []

  if (daysUntilExam > 14) {
    if (criticalCount > 0) phases.push("FOUNDATION")
    phases.push("LEARN", "PRACTICE", "TRANSFER", "REVIEW", "SIMULATION")
  } else if (daysUntilExam > 7) {
    if (criticalCount > 0) phases.push("FOUNDATION")
    phases.push("INTENSIVE_PRACTICE", "TRANSFER", "MINI_CHECK", "REVIEW", "SIMULATION")
  } else if (daysUntilExam > 3) {
    if (criticalCount > 0) phases.push("FOUNDATION_FOCUS")
    phases.push("TRANSFER", "SIMULATION")
  } else {
    phases.push("CONFIDENCE_REVIEW", "SIMULATION")
  }

  return phases
}

function allocateDaysToPhases(
  phases: string[],
  daysUntilExam: number,
  daysForSimulation: number = 2
): Record<string, number> {
  const allocation: Record<string, number> = {}
  const availableDays = Math.max(1, daysUntilExam - daysForSimulation)

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
    allocation.REVIEW = Math.max(1, availableDays - (allocation.FOUNDATION + allocation.INTENSIVE_PRACTICE + allocation.TRANSFER))
  } else if (daysUntilExam > 3) {
    allocation.FOUNDATION_FOCUS = Math.ceil(availableDays / 2)
    allocation.TRANSFER = Math.max(1, Math.floor(availableDays / 2))
  } else {
    allocation.CONFIDENCE_REVIEW = availableDays
  }

  allocation.SIMULATION = daysForSimulation

  return allocation
}

function generateDailyActivities(
  topicPriorities: LearningPriority[],
  readinessReports: Map<string, TopicReadinessReport>,
  phase: string,
  dayOfPhase: number,
  totalDaysInPhase: number
): Activity[] {
  const activities: Activity[] = []

  if (phase === "FOUNDATION" || phase === "FOUNDATION_FOCUS") {
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
          priority: ((idx + 1) as 1 | 2 | 3),
          estimatedMinutes: 20,
          reasoning: `Grundlagen (${report.readinessScore}%)`,
        })
      }
    })
  } else if (phase === "LEARN") {
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
          priority: ((idx + 1) as 1 | 2 | 3),
          estimatedMinutes: 15,
          reasoning: `ELI teaches inline`,
        })
      }
    })
  } else if (phase === "PRACTICE" || phase === "INTENSIVE_PRACTICE") {
    const practiceTopics = topicPriorities.slice(0, 2)

    practiceTopics.forEach((topic, idx) => {
      const report = readinessReports.get(topic.topicId)
      if (report) {
        activities.push({
          topicId: topic.topicId,
          topicName: report.topicName,
          activityType: "PRACTICE",
          priority: ((idx + 1) as 1 | 2 | 3),
          estimatedMinutes: 20,
          reasoning: `Übungsaufgaben`,
        })
      }
    })
  } else if (phase === "MINI_CHECK") {
    const topicsToCheck = topicPriorities.slice(0, 2)

    topicsToCheck.forEach((topic, idx) => {
      const report = readinessReports.get(topic.topicId)
      if (report) {
        activities.push({
          topicId: topic.topicId,
          topicName: report.topicName,
          activityType: "MINI_CHECK",
          priority: ((idx + 1) as 1 | 2 | 3),
          estimatedMinutes: 10,
          reasoning: `Selbst-Test`,
        })
      }
    })
  } else if (phase === "TRANSFER") {
    const topics = topicPriorities.slice(0, 2)
    if (topics.length >= 2) {
      activities.push({
        topicId: `transfer-${topics[0].topicId}-${topics[1].topicId}`,
        topicName: `Transfer: ${readinessReports.get(topics[0].topicId)?.topicName || ""} + ${readinessReports.get(topics[1].topicId)?.topicName || ""}`,
        activityType: "TRANSFER",
        priority: 1,
        estimatedMinutes: 20,
        reasoning: `Konzepte kombinieren`,
      })
    }
  } else if (phase === "REVIEW" || phase === "CONFIDENCE_REVIEW") {
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
          priority: ((idx + 1) as 1 | 2 | 3),
          estimatedMinutes: 15,
          reasoning: `Wiederholung`,
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
      reasoning: `Full-Length Test`,
    })
  }

  return activities
}

export function generateExamLearningPlan(
  examId: string,
  topicPriorities: LearningPriority[],
  readinessReports: TopicReadinessReport[],
  daysUntilExam: number
): ExamLearningPlan {
  const today = new Date()
  const examDate = new Date(today.getTime() + daysUntilExam * 24 * 60 * 60 * 1000)

  const reportMap = new Map(
    readinessReports.map((r) => [r.topicId, r])
  )

  const criticalCount = topicPriorities.filter(
    (p) => p.priority === "URGENT"
  ).length

  const phases = determinePlanPhases(daysUntilExam, criticalCount)
  const phaseAllocation = allocateDaysToPhases(phases, daysUntilExam)

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

  const phaseObj: Record<string, { days: number; topics: string[] } | undefined> = {}
  Object.keys(phaseAllocation).forEach((key) => {
    phaseObj[key] = { days: phaseAllocation[key], topics: [] }
  })

  return {
    id: `plan-${examId}-${Date.now()}`,
    examId,
    version: 1,
    status: "ACTIVE",
    generatedAt: new Date().toISOString(),
    startDate: today.toISOString().split("T")[0],
    examDate: examDate.toISOString().split("T")[0],
    daysUntilExam,
    phase: phaseObj,
    dailyPlan,
    totalMinutesNeeded: totalMinutes,
    recommendedDailyMinutes: Math.round(totalMinutes / daysUntilExam),
    criticalTopics: topicPriorities
      .filter((p) => p.priority === "URGENT")
      .map((p) => p.topicId),
    adjustmentReasons: [],
  }
}

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

  if (changeEvent.type === "MINI_CHECK_RESULT" && changeEvent.newScore !== undefined) {
    return Math.abs(changeEvent.newScore - 70) > 15
  }

  if (changeEvent.type === "FOUNDATION_CLOSED") {
    return true
  }

  return daysSinceGenerated > 3
}
