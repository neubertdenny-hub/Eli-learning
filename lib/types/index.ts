// ========== USER ==========
export type User = {
  id: "zoey" // MVP: single user only
  name: string
  gradeLevel: number
  createdAt: Date
  lastActive: Date
}

// ========== THEME (Mathematical Topic) ==========
export type Theme = {
  id: string // UUID
  title: string
  description: string
  category: string // "algebra", "geometry", etc.
  gradeLevel: number
  status: "green" | "yellow" | "red" | "new"
  lastPracticed?: Date
  subtopics: string[] // Subtopic IDs
  createdAt: Date
  updatedAt: Date
}

// ========== SUBTOPIC ==========
export type Subtopic = {
  id: string
  themeId: string
  title: string
  description: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedLearningTime: number // minutes
  foundationTopics: string[] // Topic IDs
  createdAt: Date
}

// ========== TASK ==========
export type Task = {
  id: string
  subtopicId: string
  question: string
  solution: string | number
  steps: {
    stepNumber: number
    description: string
    operation: string
  }[]
  difficulty: 1 | 2 | 3 | 4 | 5
  hints: {
    level1: string
    level2: string
    level3: string
    level4: string
    level5: string
  }
  explanations: {
    simpleText: string
    example: string
    everydayExample: string
    visualDescription: string
    numberLine?: string
  }
  requiredFoundation: string[]
  commonMistakes: string[]
  createdAt: Date
}

// ========== SESSION (20-min learning unit) ==========
export type Session = {
  id: string
  userId: "zoey"
  theme: {
    id: string
    title: string
  }
  startedAt: Date
  completedAt?: Date
  duration: number // seconds
  status: "active" | "completed" | "abandoned"
  attempts: TaskAttempt[]
  totalXP: number
  levelUpOccurred: boolean
  newFoundationGapDiscovered: boolean
  createdAt: Date
}

// ========== TASK ATTEMPT ==========
export type TaskAttempt = {
  id: string
  taskId: string
  sessionId: string
  attemptNumber: number
  submittedAt: Date
  answer: string | number
  handwritingImageUrl?: string // Blob storage URL
  classification: {
    status:
      | "A_correct"
      | "B_small_error"
      | "C_medium_error"
      | "D_foundation_gap"
      | "E_task_not_understood"
      | "F_uncertain"
    confidence: number
    errorType?: string
    errorStep?: number
    eliMessage: string
  }
  helpLevel: 0 | 1 | 2 | 3 | 4 | 5
  helpStrategiesUsed: string[]
  helpWasEffective: boolean
  xpEarned: number
  xpBonus?: number
  selfSolved: boolean
  withHelp: boolean
  notUnderstood: boolean
  correctedOnRetry: boolean
  createdAt: Date
}

// ========== ELI MEMORY (Learning Profile) ==========
export type StrategyEffectiveness = {
  strategy:
    | "simple_text"
    | "example"
    | "everyday_example"
    | "visual"
    | "number_line"
    | "spoken"
    | "bridge_task"
  topicId: string
  usageCount: number
  successAfterHelpCount: number
  averageAttemptsAfterHelp: number
  successRate: number // 0-1
  lastUsed: Date
}

export type MasteredTopic = {
  topicId: string
  title: string
  learnedDate: Date
  independentSuccesses: number
  withHelpSuccesses: number
  failures: number
  lastPracticedAt: Date
  nextReviewAt: Date
  consecutiveIndependentSuccesses: number
  consecutiveFailures: number
  masteryConfidence: number // 0-1, calculated by Mastery Engine
  reviewCount: number
  lastHelpLevel: 0 | 1 | 2 | 3 | 4 | 5
}

export type ErrorPattern = {
  errorType: string
  occurrences: number
  topicsAffected: string[]
  selfCorrectedCount: number
  correctedWithHelpCount: number
  stillFailingCount: number
  lastOccurrence: Date
  strategyEffectiveness: StrategyEffectiveness[]
}

export type ReviewSchedule = {
  topicId: string
  status: "not_scheduled" | "due_soon" | "overdue"
  lastReviewedAt: Date
  nextReviewAt: Date
  reviewCount: number
  lastPerformance: "independent" | "with_help" | "failed"
}

export type EliMemory = {
  id: string
  userId: "zoey"
  masteredTopics: MasteredTopic[]
  errorPatterns: ErrorPattern[]
  reviewSchedule: ReviewSchedule[]
  updatedAt: Date
}

// ========== MASTERY ENGINE CALCULATION ==========
export type MasteryStatus = {
  status: "green" | "yellow" | "red"
  confidence: number // 0-1
  reasoning: string
}

// ========== AI CLASSIFICATION RESULT ==========
export type ClassificationResult = {
  status:
    | "A_correct"
    | "B_small_error"
    | "C_medium_error"
    | "D_foundation_gap"
    | "E_task_not_understood"
    | "F_uncertain"
  confidence: number
  errorType?: string
  errorStep?: number
  message: string
  hintLevel1?: string
  foundationGap?: {
    topic: string
    description: string
  }
  reasoning: string
}

// ========== HELP ENGINE RESULT ==========
export type HelpSuggestion = {
  action:
    | "explain_and_retry"
    | "bridge_task_1"
    | "bridge_task_2"
    | "bridge_task_3"
    | "show_complete_solution"
    | "escalate_to_break"
  message: string
  strategy?: string
  task?: Task
  helpLevel?: 0 | 1 | 2 | 3 | 4 | 5
  allowRetry?: boolean
  suggestedAction?: string
  positiveClosing?: boolean
}

// ========== IMAGE ANALYSIS RESULT ==========
export type ImageAnalysisResult = {
  theme: {
    id: string
    title: string
    confidence: number
  }
  subtopics: Array<{
    id: string
    title: string
    confidence: number
  }>
  tasks: Array<{
    question: string
    solution?: string
    difficulty: 1 | 2 | 3 | 4 | 5
  }>
  ocrConfidence: number
  illegibleParts: string[]
  imageQuality: "clear" | "readable" | "blurry" | "mostly_illegible"
  recommendations: string[]
}

// ========== PROGRESS ENTRY (Aggregated statistics) ==========
export type ProgressEntry = {
  userId: "zoey"
  date: Date
  sessionStats: {
    count: number
    totalDuration: number
    averageDuration: number
  }
  taskStats: {
    attempted: number
    solved: number
    solvedWithoutHelp: number
    solvedWithHelp: number
    notSolved: number
  }
  xpStats: {
    earned: number
    bonus: number
    total: number
  }
  levelStats: {
    currentLevel: number
    progressToNextLevel: number
  }
  topicStats: Record<string, {
    status: "green" | "yellow" | "red"
    attemptCount: number
    successRate: number
  }>
  errorPatterns: Record<string, number>
  createdAt: Date
}
