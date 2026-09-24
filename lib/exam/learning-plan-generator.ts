/**
 * Phase 7D: Learning Plan Generator
 * Konvertiert Readiness Plan → konkrete Tagesaufgaben
 * Integriert mit Phase 5 Daily Planner
 */

import type { ExamReadinessPlan, TopicReadiness } from "@/lib/exam/readiness-engine"
import type { ExamPlanItem } from "@/lib/db/exam-schema"

export interface DayPlan {
  date: string              // ISO 8601
  dayNumber: number         // 1, 2, 3... (ab heute)
  tasks: PlanTask[]
  totalHours: number
  difficulty: "easy" | "medium" | "hard"
}

export interface PlanTask {
  id: string
  topicId: string
  topicName: string
  activityType: "LEARN" | "PRACTICE" | "TRANSFER" | "REVIEW" | "MINI_CHECK"
  estimatedMinutes: number
  instructions: string
  priority: 1 | 2 | 3       // 1=must do, 2=should do, 3=nice to have
  difficulty: "easy" | "medium" | "hard"
  relatedTopicIds?: string[] // Transfer: welche anderen Topics?
}

export interface GeneratedLearningPlan {
  examId: string
  startDate: string
  endDate: string
  daysUntilExam: number
  totalHours: number
  dayPlans: DayPlan[]
  sequenceStrategy: "weakness-first" | "balanced" | "exam-priority-first"
  notes: string
}

/**
 * Generiere strukturierten Lernplan aus Readiness
 */
export function generateLearningPlan(
  readinessPlan: ExamReadinessPlan,
  sequenceStrategy: "weakness-first" | "balanced" | "exam-priority-first" = "weakness-first"
): GeneratedLearningPlan {
  const today = new Date()
  const daysAvailable = readinessPlan.daysUntilExam
  const totalHours = readinessPlan.recommendedSchedule.totalRequiredHours

  // Ordne Topics nach Strategie
  const orderedTopics = orderTopicsByStrategy(readinessPlan, sequenceStrategy)

  // Verteile Topics über Tage
  const dayPlans = distributeToDays(
    orderedTopics,
    daysAvailable,
    readinessPlan.recommendedSchedule.dailyHours
  )

  // Endatum berechnen
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + daysAvailable)

  return {
    examId: readinessPlan.examId,
    startDate: today.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    daysUntilExam: daysAvailable,
    totalHours,
    dayPlans,
    sequenceStrategy,
    notes: generatePlanNotes(readinessPlan, sequenceStrategy),
  }
}

/**
 * Ordne Topics nach Strategie
 */
function orderTopicsByStrategy(
  plan: ExamReadinessPlan,
  strategy: "weakness-first" | "balanced" | "exam-priority-first"
): TopicReadiness[] {
  if (strategy === "weakness-first") {
    // Schwächen zuerst = schneller auf Stärke bringen
    return [
      ...plan.priority.weaknesses,
      ...plan.priority.examPriority,
      ...plan.priority.transfer,
      ...plan.priority.review,
    ]
  }

  if (strategy === "exam-priority-first") {
    // Prüfungsstoff zuerst = direkter zur Prüfung
    return [
      ...plan.priority.examPriority,
      ...plan.priority.weaknesses,
      ...plan.priority.transfer,
      ...plan.priority.review,
    ]
  }

  // balanced: Abwechslung zwischen Schwächen + Prüfungsstoff
  const balanced: TopicReadiness[] = []
  const maxLength = Math.max(
    plan.priority.weaknesses.length,
    plan.priority.examPriority.length
  )

  for (let i = 0; i < maxLength; i++) {
    if (i < plan.priority.weaknesses.length) balanced.push(plan.priority.weaknesses[i])
    if (i < plan.priority.examPriority.length) balanced.push(plan.priority.examPriority[i])
  }

  balanced.push(...plan.priority.transfer, ...plan.priority.review)
  return balanced
}

/**
 * Verteile Topics auf Tage mit abwechslungsreichen Aktivitäten
 */
function distributeToDays(
  topics: TopicReadiness[],
  daysAvailable: number,
  dailyHours: number
): DayPlan[] {
  const dayPlans: DayPlan[] = []
  const today = new Date()
  let topicIndex = 0
  const activitySequence: ("LEARN" | "PRACTICE" | "TRANSFER" | "REVIEW" | "MINI_CHECK")[] = [
    "LEARN",
    "PRACTICE",
    "TRANSFER",
    "REVIEW",
  ]
  let activityIndex = 0

  for (let day = 1; day <= daysAvailable && topicIndex < topics.length; day++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + day - 1)
    const dateStr = currentDate.toISOString().split("T")[0]

    const tasks: PlanTask[] = []
    let dayHours = 0

    // Füge Topics für diesen Tag hinzu
    while (dayHours < dailyHours && topicIndex < topics.length) {
      const topic = topics[topicIndex]
      const activityType = activitySequence[activityIndex % activitySequence.length]

      // Berechne wie lange dieses Activity dauert
      let taskMinutes = 0
      switch (activityType) {
        case "LEARN":
          taskMinutes = Math.min(60, topic.estimatedHours * 30) // First 60 min lernen
          break
        case "PRACTICE":
          taskMinutes = Math.min(90, topic.estimatedHours * 45) // 90 min üben
          break
        case "TRANSFER":
          taskMinutes = 45 // Transfer-Aufgaben: 45 min
          break
        case "REVIEW":
          taskMinutes = 20 // Quick review: 20 min
          break
        case "MINI_CHECK":
          taskMinutes = 30 // Mini-Test: 30 min
          break
      }

      // Wenn Task zu lang für den Tag, teile auf
      if (dayHours + taskMinutes / 60 > dailyHours && tasks.length > 0) {
        break
      }

      const task: PlanTask = {
        id: `${topic.topicId}-${activityType}-${day}`,
        topicId: topic.topicId,
        topicName: topic.topicName,
        activityType,
        estimatedMinutes: taskMinutes,
        instructions: getActivityInstructions(activityType, topic),
        priority: getPriority(topic, activityType),
        difficulty: getDifficulty(topic.mastery, activityType),
        relatedTopicIds: getRelatedTopics(topic, tasks),
      }

      tasks.push(task)
      dayHours += taskMinutes / 60
      activityIndex++

      // Wenn Topic fertig gelernt, nächstes Topic
      if (activityIndex % 4 === 0) {
        topicIndex++
      }
    }

    if (tasks.length > 0) {
      dayPlans.push({
        date: dateStr,
        dayNumber: day,
        tasks,
        totalHours: dayHours,
        difficulty: getDayDifficulty(tasks),
      })
    }
  }

  // Fallback: wenn nicht alle Topics gepackt, komprimiere letzte Tage
  if (topicIndex < topics.length && dayPlans.length > 0) {
    const remainingTopics = topics.slice(topicIndex)
    const lastDay = dayPlans[dayPlans.length - 1]

    for (const topic of remainingTopics) {
      lastDay.tasks.push({
        id: `${topic.topicId}-review-final`,
        topicId: topic.topicId,
        topicName: topic.topicName,
        activityType: "REVIEW",
        estimatedMinutes: 20,
        instructions: "Schnelle Wiederholung vor der Prüfung",
        priority: 2,
        difficulty: "easy",
      })
    }
  }

  return dayPlans
}

/**
 * Generiere Aktivitäts-Anleitung
 */
function getActivityInstructions(
  activityType: PlanTask["activityType"],
  topic: TopicReadiness
): string {
  const readiness = topic.readiness

  switch (activityType) {
    case "LEARN":
      if (readiness === "NOT_ASSESSED") {
        return `Lerne ${topic.topicName} von vorne: Videos anschauen → Beispiele durchgehen → Erste Aufgaben mit Unterstützung`
      }
      return `Wiederhole ${topic.topicName}: Konzepte durchgehen → 5 Aufgaben lösen → Fehler analysieren`

    case "PRACTICE":
      return `Übe ${topic.topicName} intensiv: 20+ Aufgaben verschiedener Schwierigkeit → Typische Fehler isoliert → Mit Timer üben`

    case "TRANSFER":
      return `Transfer-Aufgaben zu ${topic.topicName}: Kombinationen mit anderen Themen → Komplexe Aufgaben → Realistisches Prüfungsszenario`

    case "REVIEW":
      return `Schnelle Wiederholung ${topic.topicName}: Wichtigste Punkte → 5-10 Aufgaben → Selbstcheck`

    case "MINI_CHECK":
      return `Mini-Test zu ${topic.topicName}: 10-15 min unter Zeitdruck → Bewertung → Schwache Punkte nochmal üben`

    default:
      return `Arbeite an ${topic.topicName}`
  }
}

/**
 * Priorität (1=must, 2=should, 3=nice to have)
 */
function getPriority(topic: TopicReadiness, activityType: PlanTask["activityType"]): 1 | 2 | 3 {
  if (topic.priority === "EXAM_WEAKNESS") return 1 // Schwächen MÜSSEN gelöst werden
  if (topic.priority === "EXAM_PRIORITY" && activityType !== "REVIEW") return 1 // Prüfungsstoff muss gelernt
  if (activityType === "REVIEW") return 3 // Review ist nice-to-have
  return 2
}

/**
 * Schwierigkeit
 */
function getDifficulty(
  mastery: number,
  activityType: PlanTask["activityType"]
): "easy" | "medium" | "hard" {
  if (activityType === "LEARN" || activityType === "REVIEW") return "easy"
  if (activityType === "PRACTICE") {
    if (mastery < 50) return "medium"
    return "hard"
  }
  return "hard" // Transfer ist immer schwer
}

/**
 * Tag-Schwierigkeit basierend auf Tasks
 */
function getDayDifficulty(tasks: PlanTask[]): "easy" | "medium" | "hard" {
  const hardCount = tasks.filter(t => t.difficulty === "hard").length
  const totalTasks = tasks.length

  if (hardCount > totalTasks * 0.5) return "hard"
  if (hardCount > totalTasks * 0.25) return "medium"
  return "easy"
}

/**
 * Verwandte Topics für Transfer-Aufgaben
 */
function getRelatedTopics(currentTopic: TopicReadiness, previousTasks: PlanTask[]): string[] {
  if (currentTopic.priority !== "EXAM_TRANSFER") return []

  // Sammle die letzten gelernten Topics für Kombinationen
  return previousTasks
    .filter(t => t.activityType === "LEARN" || t.activityType === "PRACTICE")
    .map(t => t.topicId)
    .slice(-3) // Letzte 3 Topics
}

/**
 * Generiere Notizen für den Plan
 */
function generatePlanNotes(
  plan: ExamReadinessPlan,
  strategy: string
): string {
  const notes: string[] = []

  if (!plan.recommendedSchedule.isAchievable) {
    notes.push(
      `⚠️ Anspruchsvoll: Du brauchst ${plan.recommendedSchedule.dailyHours}h/Tag. Fang früh an oder konzentriere dich auf Schwächen.`
    )
  } else {
    notes.push(`✅ Erreichbar mit ${plan.recommendedSchedule.dailyHours}h/Tag.`)
  }

  if (plan.priority.weaknesses.length > 0) {
    notes.push(
      `🎯 Priorität: Löse zuerst deine ${plan.priority.weaknesses.length} Schwächen (Mastery <70%).`
    )
  }

  if (strategy === "weakness-first") {
    notes.push(
      `📈 Strategie: Schwächen zuerst → schneller zur Stärke. Dann Prüfungsstoff + Transfer.`
    )
  } else if (strategy === "exam-priority-first") {
    notes.push(`📍 Strategie: Prüfungsstoff zuerst → sichern. Dann Schwächen + Transfer.`)
  } else {
    notes.push(`⚖️ Strategie: Abwechslung zwischen Schwächen + Prüfungsstoff. Effiziente Verteilung.`)
  }

  notes.push(`📅 Tage: ${plan.daysUntilExam} Tage bis zur Prüfung.`)

  return notes.join("\n")
}

/**
 * Konvertiere Lernplan zu Phase 5 Planner Items
 */
export function convertToPhase5Items(
  plan: GeneratedLearningPlan
): ExamPlanItem[] {
  const items: ExamPlanItem[] = []

  for (const dayPlan of plan.dayPlans) {
    for (const task of dayPlan.tasks) {
      items.push({
        id: `${task.id}-phase5`,
        planId: plan.examId,
        date: dayPlan.date,
        topicId: task.topicId,
        foundationId: undefined,
        activityType: task.activityType,
        priority: task.priority,
        selectionReason: `${task.topicName}: ${task.instructions}`,
      })
    }
  }

  return items
}
