/**
 * Phase 8: Adaptive Intelligence - Central Export
 */

export * from "./types"
export * from "./strategy-analyzer"
export * from "./help-selector"
export * from "./decision-engine"
export * from "./root-cause-analyzer"
export * from "./difficulty-engine"
export * from "./forgetting-detector"
export * from "./learning-effectiveness"
export * from "./planner-integration"
export * from "./parent-insights"
export * from "./shadow-mode"

/**
 * Feature flags for Phase 8
 */
export const PHASE_8_FLAGS = {
  ADAPTIVE_INTELLIGENCE_ENABLED: process.env.ADAPTIVE_INTELLIGENCE_ENABLED === "true",
  SHADOW_MODE_ENABLED: process.env.SHADOW_MODE_ENABLED === "true",
  FALLBACK_TO_PHASE_4: process.env.FALLBACK_TO_PHASE_4 === "true",
}

/**
 * Confidence thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  LOW: 0.65,
  MEDIUM: 0.8,
  HIGH: 0.9,
}

/**
 * Min data points for confidence levels
 */
export const MIN_DATA_FOR_CONFIDENCE = {
  LOW_CONFIDENCE: 1,
  MEDIUM_CONFIDENCE: 3,
  HIGH_CONFIDENCE: 8,
}

/**
 * Forgotten detection thresholds
 */
export const FORGETTING_THRESHOLDS = {
  DAYS_BEFORE_POSSIBLE_FORGETTING: 7,
  DAYS_BEFORE_CERTAIN_FORGETTING: 14,
  MINIMUM_SUCCESS_RATE_FOR_TEMPORARY_ERROR: 0.6,
}

/**
 * Difficulty adjustment rules
 */
export const DIFFICULTY_RULES = {
  INCREASE_MIN_CONSECUTIVE_SUCCESS: 3,
  INCREASE_MIN_TRANSFER_SUCCESS_RATE: 0.7,
  DECREASE_MIN_FAILURE_COUNT: 2,
  DECREASE_MIN_HELP_LEVEL: 3,
}
