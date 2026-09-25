/**
 * Phase 8: Adaptive Intelligence Types & Constants
 */

export type LearningStrategy =
  | "SIMPLE_TEXT"
  | "STEP_BY_STEP"
  | "CONCRETE_EXAMPLE"
  | "EVERYDAY_EXAMPLE"
  | "VISUAL_REPRESENTATION"
  | "NUMBER_LINE"
  | "WORKED_EXAMPLE"
  | "BRIDGE_TASK"
  | "READ_ALOUD"
  | "TRY_FIRST"
  | "SMALLER_NUMBERS"
  | "DECOMPOSE_PROBLEM"

export type ReasonCode =
  | "REPEATED_SAME_ERROR"
  | "PREVIOUS_STRATEGY_FAILED"
  | "STRATEGY_HIGH_SUCCESS"
  | "FOUNDATION_GAP_DETECTED"
  | "TASK_TOO_EASY"
  | "TASK_TOO_HARD"
  | "RECENT_REVIEW_FAILURE"
  | "TRANSFER_FAILURE"
  | "TRANSFER_SUCCESS"
  | "POSSIBLE_FORGETTING"
  | "LOW_AI_CONFIDENCE"
  | "FIRST_ATTEMPT"
  | "INSUFFICIENT_DATA"

export type DifficultyLevel = "TOO_EASY" | "OPTIMAL" | "CHALLENGING" | "TOO_HARD"

export interface StrategyEffectiveness {
  strategy: LearningStrategy
  topicId?: string
  foundationId?: string
  errorType?: string
  usageCount: number
  immediateSuccessCount: number
  delayedSuccessCount: number
  transferSuccessCount: number
  effectiveness: number // 0-1
  confidence: number // 0-1
  lastUsedAt?: Date
}

export interface AdaptiveDecisionContext {
  userId: string
  taskId?: string
  topic?: string
  foundation?: string
  errorType?: string
  previousAttempts: number
  previousHelpLevels: number[]
  currentDifficulty: number
  masteryScore: number
  recentErrors: boolean
  transferSuccess?: boolean
  lastActivityTime?: Date
}

export interface AdaptiveDecisionResult {
  decisionType: "HELP_STRATEGY" | "DIFFICULTY" | "REVIEW" | "FOUNDATION_CHECK"
  selectedStrategy?: LearningStrategy
  selectedHelpLevel?: number // 0-5
  newDifficulty?: number
  confidence: number
  reasonCodes: ReasonCode[]
  explanation?: string
}

export interface LearningMetrics {
  independentSuccessRate: number // 0-1
  averageHelpLevel: number // 0-5
  selfCorrectionRate: number // 0-1
  transferSuccessRate: number // 0-1
  foundationGapCount: number
  reviewRetentionRate: number // 0-1
  activeLearningTimeMinutes: number
  masteredTopicsCount: number
  totalAttempts: number
  correctAttempts: number
}

export interface ConfidenceLevel {
  value: number // 0-1
  level: "LOW" | "MEDIUM" | "HIGH"
}

export function getConfidenceLevel(value: number): ConfidenceLevel["level"] {
  if (value < 0.65) return "LOW"
  if (value < 0.85) return "MEDIUM"
  return "HIGH"
}

export const STRATEGY_DESCRIPTIONS: Record<LearningStrategy, string> = {
  SIMPLE_TEXT: "Klare, kurze Erklärung",
  STEP_BY_STEP: "Schritt-für-Schritt-Anleitung",
  CONCRETE_EXAMPLE: "Konkretes Beispiel mit Zahlen",
  EVERYDAY_EXAMPLE: "Alltagsbeispiel",
  VISUAL_REPRESENTATION: "Visuelle Darstellung",
  NUMBER_LINE: "Zahlenstrahl",
  WORKED_EXAMPLE: "Gelöste Beispielaufgabe",
  BRIDGE_TASK: "Vereinfachte Aufgabe als Brücke",
  READ_ALOUD: "Aufgabe vorlesen",
  TRY_FIRST: "Erst selbst versuchen",
  SMALLER_NUMBERS: "Mit kleineren Zahlen üben",
  DECOMPOSE_PROBLEM: "Aufgabe in Teile zerlegen",
}

export const MIN_DATA_POINTS = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 8,
}
