/**
 * Phase 8F: Adaptive Intelligence Integration
 * Signals to Phase 5 Daily Planner & Phase 7 Exam Planner
 */

export type PlannerSignal =
  | "REVIEW_NEEDED"
  | "FOUNDATION_CHECK"
  | "DIFFICULTY_INCREASE"
  | "DIFFICULTY_DECREASE"
  | "TRANSFER_READY"
  | "POSSIBLE_FORGETTING"
  | "OVERLOAD_DETECTED"
  | "MASTERY_ACHIEVED"

export interface AdaptivePlannerSignal {
  signal: PlannerSignal
  topic: string
  priority: number // 0-10 (higher = more urgent)
  confidence: number // 0-1
  recommendedAction?: string
  affectsDaysAhead?: number // How many days forward to apply
}

/**
 * Generate signals for Phase 5 Daily Planner
 */
export function generatePhase5Signals(context: {
  userId: string
  topic: string
  recentPerformance: number // 0-1
  masteryLevel: number // 0-5
  daysSincePractice: number
  hasFoundationGap: boolean
  transferSuccessRate: number
  consecutiveSuccesses: number
}): AdaptivePlannerSignal[] {
  const signals: AdaptivePlannerSignal[] = []

  // Signal 1: Foundation gap detected
  if (context.hasFoundationGap) {
    signals.push({
      signal: "FOUNDATION_CHECK",
      topic: context.topic,
      priority: 8,
      confidence: 0.75,
      recommendedAction: "Quick foundation check before continuing",
      affectsDaysAhead: 1,
    })
  }

  // Signal 2: Possible forgetting
  if (context.masteryLevel >= 3 && context.daysSincePractice > 7) {
    signals.push({
      signal: "POSSIBLE_FORGETTING",
      topic: context.topic,
      priority: 6,
      confidence: 0.7,
      recommendedAction: "Include quick review in today's mission",
      affectsDaysAhead: 0,
    })
  }

  // Signal 3: Ready for more difficulty
  if (
    context.consecutiveSuccesses >= 3 &&
    context.recentPerformance > 0.8 &&
    context.transferSuccessRate > 0.7
  ) {
    signals.push({
      signal: "DIFFICULTY_INCREASE",
      topic: context.topic,
      priority: 5,
      confidence: 0.85,
      recommendedAction: "Next tasks should be slightly harder",
      affectsDaysAhead: 1,
    })
  }

  // Signal 4: Overload - reduce difficulty
  if (context.recentPerformance < 0.3) {
    signals.push({
      signal: "OVERLOAD_DETECTED",
      topic: context.topic,
      priority: 9,
      confidence: 0.8,
      recommendedAction: "Reduce difficulty, offer bridge tasks",
      affectsDaysAhead: 1,
    })
  }

  // Signal 5: Mastery achieved
  if (context.masteryLevel >= 4 && context.transferSuccessRate > 0.8) {
    signals.push({
      signal: "MASTERY_ACHIEVED",
      topic: context.topic,
      priority: 3,
      confidence: 0.9,
      recommendedAction: "Move to advanced topics or transfer challenges",
      affectsDaysAhead: 3,
    })
  }

  return signals
}

/**
 * Generate signals for Phase 7 Exam Planner
 */
export function generatePhase7Signals(context: {
  userId: string
  topic: string
  examTopicPriority: number // from exam readiness
  masteryLevel: number // 0-5
  transferSuccessRate: number
  reviewRetentionRate: number
  daysUntilExam: number
}): AdaptivePlannerSignal[] {
  const signals: AdaptivePlannerSignal[] = []

  // Signal 1: Exam topic weak on transfer
  if (context.examTopicPriority >= 7 && context.transferSuccessRate < 0.6) {
    signals.push({
      signal: "TRANSFER_READY",
      topic: context.topic,
      priority: 9,
      confidence: 0.8,
      recommendedAction: "Prioritize transfer tasks for this exam topic",
      affectsDaysAhead: Math.min(context.daysUntilExam, 7),
    })
  }

  // Signal 2: Exam topic shaky retention
  if (context.examTopicPriority >= 6 && context.reviewRetentionRate < 0.65) {
    signals.push({
      signal: "REVIEW_NEEDED",
      topic: context.topic,
      priority: 7,
      confidence: 0.75,
      recommendedAction: "Add to exam review rotation",
      affectsDaysAhead: Math.min(context.daysUntilExam, 5),
    })
  }

  // Signal 3: Exam topic not yet mastered
  if (context.examTopicPriority >= 8 && context.masteryLevel < 3) {
    signals.push({
      signal: "FOUNDATION_CHECK",
      topic: context.topic,
      priority: 8,
      confidence: 0.85,
      recommendedAction: "Ensure fundamentals solid before exam",
      affectsDaysAhead: Math.min(context.daysUntilExam, 10),
    })
  }

  return signals
}

/**
 * Apply signals to Phase 5: modify mission priority/content
 */
export function applySignalsToPhase5(
  signals: AdaptivePlannerSignal[],
  plannedMission: any
): any {
  const modifiedMission = { ...plannedMission }

  // Sort by priority (highest first)
  const prioritizedSignals = signals.sort((a, b) => b.priority - a.priority)

  if (prioritizedSignals.length === 0) return modifiedMission

  const topSignal = prioritizedSignals[0]

  switch (topSignal.signal) {
    case "FOUNDATION_CHECK":
      modifiedMission.missionType = "FOUNDATION_CHECK"
      modifiedMission.quickCheckTasks = 2
      break

    case "OVERLOAD_DETECTED":
      modifiedMission.difficulty = Math.max(1, modifiedMission.difficulty - 1)
      modifiedMission.taskCount = Math.max(3, modifiedMission.taskCount - 2)
      break

    case "DIFFICULTY_INCREASE":
      modifiedMission.difficulty = Math.min(10, modifiedMission.difficulty + 1)
      break

    case "DIFFICULTY_DECREASE":
      modifiedMission.difficulty = Math.max(1, modifiedMission.difficulty - 1)
      break

    case "POSSIBLE_FORGETTING":
      modifiedMission.includeReview = true
      modifiedMission.reviewTasks = 2
      break

    case "TRANSFER_READY":
      modifiedMission.includeTransfer = true
      modifiedMission.transferTasks = 2
      break

    case "MASTERY_ACHIEVED":
      modifiedMission.nextTopics = ["advanced_variant", "application"]
      break
  }

  modifiedMission.adaptiveSignal = topSignal
  return modifiedMission
}

/**
 * Apply signals to Phase 7: modify exam prep priorities
 */
export function applySignalsToPhase7(
  signals: AdaptivePlannerSignal[],
  examPlan: any
): any {
  const modifiedPlan = { ...examPlan }

  const prioritizedSignals = signals.sort((a, b) => b.priority - a.priority)

  for (const signal of prioritizedSignals.slice(0, 3)) {
    // Apply top 3 signals

    const topicIndex = modifiedPlan.dailyPlan.findIndex(
      (item: any) => item.topicId === signal.topic
    )

    if (topicIndex >= 0) {
      switch (signal.signal) {
        case "REVIEW_NEEDED":
          modifiedPlan.dailyPlan[topicIndex].reviewPriority = Math.min(
            10,
            (modifiedPlan.dailyPlan[topicIndex].reviewPriority || 5) + 2
          )
          break

        case "TRANSFER_READY":
          modifiedPlan.dailyPlan[topicIndex].transferTasksNeeded = true
          break

        case "FOUNDATION_CHECK":
          modifiedPlan.dailyPlan[topicIndex].includeFoundationCheck = true
          break
      }
    }
  }

  modifiedPlan.adaptiveSignals = signals
  return modifiedPlan
}
