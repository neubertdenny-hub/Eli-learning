/**
 * Phase 7G: Practice Exam Generator
 * 
 * Creates realistic practice exams that test ALL confirmed topics
 * Including weak topics - comprehensive coverage
 */

import type { TopicReadinessReport, LearningPriority } from "./readiness-engine"

export interface PracticeExamTask {
  id: string
  topicId: string
  topicName: string
  taskText: string
  taskType: "multiple-choice" | "short-answer" | "calculation" | "open-ended"
  difficulty: "easy" | "medium" | "hard"
  pointsPossible: number
  options?: string[] // for multiple-choice
  correctAnswer?: string
  explanation: string
  estimatedMinutes: number
}

export interface PracticeExam {
  id: string
  examId: string
  generatedAt: string
  
  // Metadata
  title: string
  description: string
  estimatedTotalMinutes: number
  totalPointsPossible: number
  
  // Content
  tasks: PracticeExamTask[]
  topicCoverage: Record<string, number> // topicId -> task count
  
  // Guidance
  instructions: string[]
  allowedAids: string[]
}

export interface PracticeExamResult {
  id: string
  examId: string
  practiceExamId: string
  startedAt: string
  completedAt?: string
  status: "IN_PROGRESS" | "SUBMITTED" | "ANALYZED"
  
  // Scoring
  taskResults: Array<{
    taskId: string
    topicId: string
    pointsEarned: number
    pointsPossible: number
    isCorrect: boolean
    userAnswer?: string
  }>
  
  // Summary
  totalPointsEarned?: number
  totalPointsPossible?: number
  percentageScore?: number
  
  // Analysis
  topicPerformance?: Record<string, {
    correct: number
    total: number
    percentage: number
  }>
  strengthTopics?: string[]
  weakTopics?: string[]
  
  // Feedback
  analysis?: string
  nextSteps?: string[]
}

/**
 * Generate practice exam covering ALL confirmed topics
 * Weighted by: material frequency + priority + readiness
 * MUST include weak topics (not just 70%+)
 */
export function generatePracticeExam(
  examId: string,
  confirmedTopicIds: string[],
  readinessReports: TopicReadinessReport[],
  optionalParams?: {
    totalMinutes?: number
    pointsPerTask?: number
    includeOnlyReady?: boolean // false = include all
  }
): PracticeExam {
  const totalMinutes = optionalParams?.totalMinutes || 90
  const pointsPerTask = optionalParams?.pointsPerTask || 10
  const includeOnlyReady = optionalParams?.includeOnlyReady ?? false

  // Filter topics to include
  let topicsToTest = readinessReports.filter((r) =>
    confirmedTopicIds.includes(r.topicId)
  )

  // IMPORTANT: Don't exclude weak topics!
  // We want comprehensive coverage
  if (includeOnlyReady) {
    topicsToTest = topicsToTest.filter((r) => r.readinessScore >= 70)
  }

  if (topicsToTest.length === 0) {
    throw new Error("No topics to test")
  }

  // Calculate task allocation
  // Weak topics get more tasks to ensure mastery
  const taskAllocation = allocateTasksByTopic(
    topicsToTest,
    totalMinutes,
    pointsPerTask
  )

  // Generate tasks
  const tasks: PracticeExamTask[] = []
  let taskId = 0

  Object.entries(taskAllocation).forEach(([topicId, count]) => {
    const topicReport = topicsToTest.find((r) => r.topicId === topicId)
    if (!topicReport) return

    for (let i = 0; i < count; i++) {
      taskId++
      const difficulty = determineDifficulty(topicReport.readinessScore)
      const task = generateTaskForTopic(
        topicId,
        topicReport.topicName,
        difficulty,
        taskId,
        pointsPerTask
      )
      tasks.push(task)
    }
  })

  // Calculate coverage
  const topicCoverage: Record<string, number> = {}
  tasks.forEach((task) => {
    topicCoverage[task.topicId] = (topicCoverage[task.topicId] || 0) + 1
  })

  return {
    id: `pratice-${examId}-${Date.now()}`,
    examId,
    generatedAt: new Date().toISOString(),
    title: "Probe-Klassenarbeit (ELI-generiert)",
    description: `Umfassender Übungstest über alle ${topicsToTest.length} Prüfungsthemen`,
    estimatedTotalMinutes: totalMinutes,
    totalPointsPossible: tasks.length * pointsPerTask,
    tasks,
    topicCoverage,
    instructions: [
      "Dies ist eine Probe-Klassenarbeit (kein echter Schultest)",
      "Alle Aufgaben selbstständig lösen",
      "Keine Hilfsmittel außer Taschenrechner (falls erlaubt)",
      "Voice kann Aufgaben vorlesen (ohne mathematische Hinweise)",
      "Nach Abgabe: Detaillierte Analyse + Feedback",
    ],
    allowedAids: [
      "Taschenrechner",
      "Papier und Stift",
      "Voice-Vorlesen (Text only)",
    ],
  }
}

/**
 * Allocate tasks by topic readiness
 * Weak topics (readiness <50%) get more tasks
 * Ready topics (readiness >=80%) get fewer
 */
function allocateTasksByTopic(
  topics: TopicReadinessReport[],
  totalMinutes: number,
  pointsPerTask: number
): Record<string, number> {
  const allocation: Record<string, number> = {}

  // Calculate total readiness-weighted allocation
  const totalTasks = Math.floor(totalMinutes / 10) // ~10 min per task avg

  // Weight: inverse of readiness (weak = more tasks)
  const weights: Record<string, number> = {}
  let totalWeight = 0

  topics.forEach((topic) => {
    // Weak (0-50%): weight = 2.0
    // Working (50-80%): weight = 1.0
    // Ready (80-100%): weight = 0.5
    let weight = 1.0
    if (topic.readinessScore < 50) weight = 2.0
    else if (topic.readinessScore >= 80) weight = 0.5

    weights[topic.topicId] = weight
    totalWeight += weight
  })

  // Allocate tasks proportionally
  topics.forEach((topic) => {
    const proportion = weights[topic.topicId] / totalWeight
    const taskCount = Math.max(2, Math.round(totalTasks * proportion))
    allocation[topic.topicId] = taskCount
  })

  return allocation
}

/**
 * Determine task difficulty based on readiness
 */
function determineDifficulty(readinessScore: number): "easy" | "medium" | "hard" {
  if (readinessScore < 50) return "easy" // Foundation weak
  if (readinessScore < 70) return "medium" // Working on it
  return "hard" // Ready for challenges
}

/**
 * Generate a single task for a topic
 * Returns realistic exam-style task
 */
function generateTaskForTopic(
  topicId: string,
  topicName: string,
  difficulty: "easy" | "medium" | "hard",
  taskIndex: number,
  points: number
): PracticeExamTask {
  // Task types by difficulty
  const taskTypes =
    difficulty === "easy"
      ? ["multiple-choice", "short-answer"]
      : difficulty === "medium"
        ? ["multiple-choice", "calculation", "short-answer"]
        : ["calculation", "open-ended"] // hard = calculation or open-ended

  const taskType = taskTypes[
    Math.floor(Math.random() * taskTypes.length)
  ] as PracticeExamTask["taskType"]

  // Estimate time
  const timeEstimates = {
    "multiple-choice": 3,
    "short-answer": 5,
    calculation: 8,
    "open-ended": 15,
  }

  return {
    id: `task-${taskIndex}`,
    topicId,
    topicName,
    taskText: generateTaskText(topicName, difficulty, taskType),
    taskType,
    difficulty,
    pointsPossible: points,
    options:
      taskType === "multiple-choice"
        ? ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]
        : undefined,
    correctAnswer: generateCorrectAnswer(topicName, difficulty),
    explanation: generateExplanation(topicName, difficulty),
    estimatedMinutes: timeEstimates[taskType] || 5,
  }
}

/**
 * Generate realistic task text
 */
function generateTaskText(
  topicName: string,
  difficulty: "easy" | "medium" | "hard",
  taskType: string
): string {
  const templates: Record<string, Record<string, string>> = {
    Bruchrechnung: {
      easy: "Kürze den Bruch 4/8 so weit wie möglich.",
      medium: "Berechne: 3/4 + 2/5 = ?",
      hard: "Vereinfache: (2/3 × 9/4) ÷ 3/2 = ?",
    },
    "Negative Zahlen": {
      easy: "Berechne: -5 + 3 = ?",
      medium: "Berechne: -4 × (-6) = ?",
      hard: "Löse: -3x + 15 = 0",
    },
    Multiplikation: {
      easy: "Berechne: 7 × 8 = ?",
      medium: "Berechne: 23 × 45 = ?",
      hard: "Berechne: 0,5 × 0,25 = ?",
    },
  }

  return (
    templates[topicName]?.[difficulty] ||
    `Aufgabe zu ${topicName} (Schwierigkeit: ${difficulty})`
  )
}

/**
 * Generate correct answer
 */
function generateCorrectAnswer(topicName: string, difficulty: string): string {
  const answers: Record<string, Record<string, string>> = {
    Bruchrechnung: {
      easy: "1/2",
      medium: "23/20",
      hard: "1",
    },
    "Negative Zahlen": {
      easy: "-2",
      medium: "24",
      hard: "5",
    },
    Multiplikation: {
      easy: "56",
      medium: "1035",
      hard: "0,125",
    },
  }

  return answers[topicName]?.[difficulty] || "Siehe Erklärung"
}

/**
 * Generate explanation
 */
function generateExplanation(topicName: string, difficulty: string): string {
  return `Schritt-für-Schritt Erklärung für ${topicName} (${difficulty})`
}

/**
 * Initialize practice exam result tracking
 */
export function initializePracticeExamResult(
  examId: string,
  practiceExamId: string
): PracticeExamResult {
  return {
    id: `result-${practiceExamId}-${Date.now()}`,
    examId,
    practiceExamId,
    startedAt: new Date().toISOString(),
    status: "IN_PROGRESS",
    taskResults: [],
  }
}

/**
 * Record answer for a task
 */
export function recordTaskAnswer(
  result: PracticeExamResult,
  taskId: string,
  topicId: string,
  userAnswer: string,
  isCorrect: boolean,
  pointsEarned: number,
  pointsPossible: number
): PracticeExamResult {
  return {
    ...result,
    taskResults: [
      ...result.taskResults,
      {
        taskId,
        topicId,
        pointsEarned,
        pointsPossible,
        isCorrect,
        userAnswer,
      },
    ],
  }
}

/**
 * Finalize and analyze practice exam results
 */
export function analyzePracticeExamResult(
  result: PracticeExamResult,
  exam: PracticeExam
): PracticeExamResult {
  const totalPointsEarned = result.taskResults.reduce(
    (sum, r) => sum + r.pointsEarned,
    0
  )
  const totalPointsPossible = exam.totalPointsPossible
  const percentageScore = Math.round((totalPointsEarned / totalPointsPossible) * 100)

  // Analyze by topic
  const topicPerformance: Record<string, { correct: number; total: number; percentage: number }> = {}

  result.taskResults.forEach((taskResult) => {
    if (!topicPerformance[taskResult.topicId]) {
      topicPerformance[taskResult.topicId] = {
        correct: 0,
        total: 0,
        percentage: 0,
      }
    }
    topicPerformance[taskResult.topicId].total += 1
    if (taskResult.isCorrect) {
      topicPerformance[taskResult.topicId].correct += 1
    }
  })

  Object.keys(topicPerformance).forEach((topicId) => {
    const perf = topicPerformance[topicId]
    perf.percentage = Math.round((perf.correct / perf.total) * 100)
  })

  // Identify strengths and weaknesses
  const strengthTopics = Object.entries(topicPerformance)
    .filter(([_, perf]) => perf.percentage >= 80)
    .map(([topicId, _]) => topicId)

  const weakTopics = Object.entries(topicPerformance)
    .filter(([_, perf]) => perf.percentage < 70)
    .map(([topicId, _]) => topicId)

  return {
    ...result,
    status: "ANALYZED",
    completedAt: new Date().toISOString(),
    totalPointsEarned,
    totalPointsPossible,
    percentageScore,
    topicPerformance,
    strengthTopics,
    weakTopics,
    analysis: generateAnalysis(percentageScore, strengthTopics, weakTopics),
    nextSteps: generateNextSteps(percentageScore, weakTopics),
  }
}

/**
 * Generate feedback analysis
 */
function generateAnalysis(
  score: number,
  strengths: string[],
  weaknesses: string[]
): string {
  if (score >= 80) {
    return `✅ Ausgezeichnet! Du erreichst ${score}% und beherrschst die meisten Topics.`
  } else if (score >= 70) {
    return `🟡 Gut! Mit ${score}% bist du auf einem guten Weg. Noch etwas Fokus auf schwache Bereiche.`
  } else {
    return `⚠️ ${score}% - Du brauchst noch mehr Übung bei den schwachen Topics.`
  }
}

/**
 * Generate actionable next steps
 */
function generateNextSteps(score: number, weakTopics: string[]): string[] {
  const steps: string[] = []

  if (score >= 85) {
    steps.push("✅ Du bist exam-ready! Kurze tägliche Wiederholung reicht.")
  } else if (score >= 70) {
    steps.push("🟡 Konzentriere dich auf diese schwachen Themen:")
    weakTopics.forEach((topic) => {
      steps.push(`  - ${topic}: Mehr Übungsaufgaben`)
    })
  } else {
    steps.push("⚠️ Diese Topics brauchen intensive Wiederholung:")
    weakTopics.forEach((topic) => {
      steps.push(`  - ${topic}: Von vorne lernen + üben`)
    })
    steps.push("💡 Nutze Mini-Checks zur Selbstprüfung")
  }

  return steps
}
