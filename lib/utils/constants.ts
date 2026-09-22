/**
 * Application Constants and Configuration
 */

export const APP_CONFIG = {
  name: "ELI",
  version: "0.1.0",
  description: "AI Learning Companion for Mathematics",

  // ========== USER ==========
  defaultUser: {
    id: "zoey",
    name: "Zoey",
    gradeLevel: 7,
  },

  // ========== LEARNING ==========
  sessionDuration: {
    target: 20 * 60, // 20 minutes in seconds
    soft_warning: 18 * 60, // Warn at 18 minutes
    hard_stop: 25 * 60, // Hard stop at 25 minutes
  },

  // ========== GAMIFICATION ==========
  xpRewards: {
    correctWithoutHelp: 20,
    correctWithHelp: 15,
    correctWithLevel4: 10,
    correctWithLevel5: 5,
    selfCorrected: 20,
    sessionBonus: 10,
    bonusThreshold: 5, // bonus after N successful tasks
  },

  levels: {
    maxLevel: 5,
    xpPerLevel: 100,
    levelNames: [
      "Mathe-Rookie",
      "Zahlen-Checker",
      "Rechen-Profi",
      "Mathe-Held",
      "Zahlen-Boss",
    ],
  },

  // ========== MASTERY ENGINE THRESHOLDS ==========
  mastery: {
    greenCriteria: {
      minIndependentSuccesses: 5,
      minConsecutiveSuccesses: 3,
      maxHelpLevelUsed: 1,
      minDaysSinceLastReview: 1,
    },
    yellowCriteria: {
      minAttempts: 3,
      minWithHelpSuccesses: 2,
      maxConsecutiveFailures: 1,
    },
  },

  // ========== SPACED REPETITION ==========
  spaced: {
    reviewDaysAfterIndependent: 3,
    reviewDaysAfterWithHelp: 1,
    reviewDaysAfterFailed: 0.5,
  },

  // ========== HELP ENGINE ==========
  help: {
    maxAttemptsBeforeEscalation: 7,
    strategies: [
      "simple_text",
      "example",
      "everyday_example",
      "visual",
      "number_line",
      "spoken",
      "bridge_task",
    ],
  },

  // ========== UI/UX ==========
  ui: {
    touchTargetMinSize: 44, // pixels
    breakpoints: {
      mobile: 640,
      tablet: 1024,
      desktop: 1280,
    },
  },

  // ========== PWA ==========
  pwa: {
    appName: "ELI",
    shortName: "ELI",
    theme: "#0066cc",
    backgroundColor: "#ffffff",
  },
}

// ========== ERROR TYPES ==========

export const ERROR_TYPES = {
  SIGN_ERROR: "sign_error",
  CALCULATION_ERROR: "calculation_error",
  WRONG_OPERATION: "wrong_operation",
  CONCEPTUAL_MISUNDERSTANDING: "conceptual_misunderstanding",
  MISSING_STEP: "missing_step",
  FORMATTING_ERROR: "formatting_error",
}

// ========== HELP STRATEGIES ==========

export const HELP_STRATEGIES = {
  SIMPLE_TEXT: "simple_text",
  EXAMPLE: "example",
  EVERYDAY_EXAMPLE: "everyday_example",
  VISUAL: "visual",
  NUMBER_LINE: "number_line",
  SPOKEN: "spoken",
  BRIDGE_TASK: "bridge_task",
}

// ========== MASTERY STATUS ==========

export const MASTERY_STATUS = {
  GREEN: "green",
  YELLOW: "yellow",
  RED: "red",
  NEW: "new",
}

// ========== CLASSIFICATION STATUS ==========

export const CLASSIFICATION_STATUS = {
  CORRECT: "A_correct",
  SMALL_ERROR: "B_small_error",
  MEDIUM_ERROR: "C_medium_error",
  FOUNDATION_GAP: "D_foundation_gap",
  TASK_NOT_UNDERSTOOD: "E_task_not_understood",
  UNCERTAIN: "F_uncertain",
}
