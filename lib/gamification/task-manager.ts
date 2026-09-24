/**
 * Task Manager - Adaptive Task Generation & Tracking
 * Verhindert Task-Wiederholung und generiert neue Aufgaben basierend auf Mastery
 */

export interface CompletedTask {
  id: string
  topicId: string
  taskType: string
  completedAt: string
  score: number // 0-100
  duration: number // seconds
}

export interface TaskState {
  userId: string
  currentTaskId: string
  completedTasks: CompletedTask[]
  lastUpdated: string
}

/**
 * Generiere nächste Aufgabe - NICHT die gleiche wiederholen
 */
export function getNextTask(
  topicId: string,
  currentTaskId: string,
  completedTaskIds: string[],
  mastery: number
): { taskId: string; difficulty: "easy" | "medium" | "hard" } {
  // Filtere bereits gelöste Tasks aus
  const availableTaskIds = generateAvailableTasks(topicId, mastery).filter(
    id => !completedTaskIds.includes(id) && id !== currentTaskId
  )

  // Wenn alle Tasks gelöst, generiere neue basierend auf Mastery
  if (availableTaskIds.length === 0) {
    return generateNewTask(topicId, mastery, completedTaskIds.length)
  }

  // Wähle nächste Task
  const nextTaskId = availableTaskIds[0]
  const difficulty = determineDifficulty(mastery, completedTaskIds.length)

  return { taskId: nextTaskId, difficulty }
}

/**
 * Verfügbare Task-IDs für ein Topic
 */
function generateAvailableTasks(topicId: string, mastery: number): string[] {
  // Task-Pool basierend auf Topic
  const baseTasks = generateTaskPool(topicId)

  // Filtern nach Mastery-Level
  const baseCount = 10 // 10 grundlegende Tasks
  const advancedCount = Math.ceil((mastery / 100) * 10) // Mehr Tasks je höher Mastery

  return [
    ...baseTasks.slice(0, baseCount),
    ...baseTasks.slice(baseCount, baseCount + advancedCount),
  ]
}

/**
 * Task-Pool generieren (Mock - würde aus DB kommen)
 */
function generateTaskPool(topicId: string): string[] {
  const lower = topicId.toLowerCase()

  if (lower.includes("bruch")) {
    return [
      "bruch-add-1",
      "bruch-add-2",
      "bruch-add-3",
      "bruch-sub-1",
      "bruch-sub-2",
      "bruch-mul-1",
      "bruch-mul-2",
      "bruch-div-1",
      "bruch-div-2",
      "bruch-complex-1",
      "bruch-complex-2",
      "bruch-transfer-1",
      "bruch-transfer-2",
      "bruch-transfer-3",
      "bruch-exam-1",
      "bruch-exam-2",
      "bruch-exam-3",
      "bruch-exam-4",
      "bruch-exam-5",
      "bruch-exam-6",
    ]
  }

  if (lower.includes("negativ")) {
    return [
      "neg-add-1",
      "neg-add-2",
      "neg-sub-1",
      "neg-sub-2",
      "neg-mul-1",
      "neg-mul-2",
      "neg-div-1",
      "neg-div-2",
      "neg-mixed-1",
      "neg-mixed-2",
      "neg-complex-1",
      "neg-complex-2",
      "neg-exam-1",
      "neg-exam-2",
      "neg-exam-3",
      "neg-exam-4",
      "neg-exam-5",
      "neg-exam-6",
      "neg-exam-7",
      "neg-exam-8",
    ]
  }

  // Fallback: generische Tasks
  return Array.from({ length: 20 }, (_, i) => `task-${topicId}-${i + 1}`)
}

/**
 * Bestimme Schwierigkeit basierend auf Mastery + Progress
 */
function determineDifficulty(
  mastery: number,
  completedCount: number
): "easy" | "medium" | "hard" {
  // Progression: Easy → Medium → Hard
  if (completedCount < 3) return "easy"
  if (completedCount < 7) return "medium"
  if (mastery < 70) return "medium" // Schwache Stellen mehr üben
  return "hard" // Fortgeschrittene: schwere Tasks
}

/**
 * Generiere komplett neue Task (wenn alle gelöst)
 */
function generateNewTask(
  topicId: string,
  mastery: number,
  completedCount: number
): { taskId: string; difficulty: "easy" | "medium" | "hard" } {
  const timestamp = Date.now()
  const difficulty = determineDifficulty(mastery, completedCount)

  // Generiere eindeutige Task-ID
  const taskId = `${topicId}-generated-${difficulty}-${timestamp}`

  return { taskId, difficulty }
}

/**
 * Markiere Task als gelöst + Update Points
 */
export function completeTask(
  taskId: string,
  topicId: string,
  score: number,
  duration: number
): {
  xpEarned: number
  coinsEarned: number
  masterUpdate: number
} {
  // XP basierend auf Score + Duration
  const baseXP = 10
  const scoreBonus = Math.round((score / 100) * 20) // +0-20 XP
  const speedBonus = duration < 180 ? 5 : 0 // +5 XP wenn < 3 Min
  const xpEarned = baseXP + scoreBonus + speedBonus

  // Coins basierend auf Score
  const coinsEarned = score >= 80 ? 5 : score >= 60 ? 3 : 1

  // Mastery-Update: +1-3% basierend auf Score
  const masterUpdate = score >= 80 ? 3 : score >= 60 ? 2 : 1

  return { xpEarned, coinsEarned, masterUpdate }
}

/**
 * Checke ob Task bereits gelöst
 */
export function isTaskCompleted(taskId: string, completedTasks: CompletedTask[]): boolean {
  return completedTasks.some(t => t.id === taskId)
}

/**
 * Hole Completion Status
 */
export function getCompletionStats(
  topicId: string,
  completedTasks: CompletedTask[]
): {
  completedCount: number
  averageScore: number
  totalXP: number
  totalCoins: number
} {
  const topicTasks = completedTasks.filter(t => t.topicId === topicId)

  const completedCount = topicTasks.length
  const averageScore = topicTasks.length > 0
    ? Math.round(topicTasks.reduce((sum, t) => sum + t.score, 0) / topicTasks.length)
    : 0

  const totalXP = topicTasks.reduce((sum, t) => sum + Math.round((t.score / 100) * 25), 0)
  const totalCoins = topicTasks.reduce((sum, t) => sum + (t.score >= 80 ? 5 : 3), 0)

  return { completedCount, averageScore, totalXP, totalCoins }
}
