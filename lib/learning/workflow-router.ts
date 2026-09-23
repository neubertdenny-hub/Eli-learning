/**
 * Workflow Router
 * Routes between different learning flows based on classification
 * - Normal Flow (A/B/C)
 * - Foundation Gap Flow (D)
 * - Problem Clarification Flow (E)
 * - Input Confirmation Flow (F)
 */

import { AnswerClassification, HelpSuggestion } from "@/lib/ai/schemas"

export type WorkflowType = "normal" | "foundation_gap" | "clarify_problem" | "confirm_input"

export interface WorkflowDecision {
  workflow: WorkflowType
  action: string
  eli_message: string
  mood: "happy" | "explaining" | "encouraging" | "thinking"
  next_step: string
  should_reprompt: boolean
  data?: Record<string, unknown>
}

/**
 * Route to appropriate workflow based on classification
 */
export function routeToWorkflow(
  classification: AnswerClassification,
  isCorrect: boolean,
  helpSuggestion?: HelpSuggestion,
  foundationGaps?: string[],
  attemptCount: number = 1
): WorkflowDecision {
  // KATEGORIE A – RICHTIG
  if (classification === "A") {
    return {
      workflow: "normal",
      action: "celebrate_and_advance",
      eli_message: "✅ Genau richtig! Du machst echte Fortschritte! 🎉",
      mood: "happy",
      next_step: "next_task",
      should_reprompt: false,
    }
  }

  // KATEGORIE B – KLEINER FEHLER
  if (classification === "B") {
    const messages = [
      "💡 Fast! Schau nochmal auf das Detail... 👀",
      "🤔 Sehr nah dran! Aber etwas stimmt nicht...",
      "📝 Der Ansatz ist richtig, aber eine Zahl ist falsch!",
    ]
    const message = messages[Math.min(attemptCount - 1, messages.length - 1)]

    return {
      workflow: "normal",
      action: "reprompt_with_hint",
      eli_message: message,
      mood: "encouraging",
      next_step: "reprompt",
      should_reprompt: true,
    }
  }

  // KATEGORIE C – MITTLERER FEHLER
  if (classification === "C") {
    if (attemptCount < 2) {
      return {
        workflow: "normal",
        action: "give_direction",
        eli_message: "🤨 Ein Schritt passt nicht. Welcher könnte es sein?",
        mood: "thinking",
        next_step: "reprompt",
        should_reprompt: true,
      }
    }

    return {
      workflow: "normal",
      action: "explain_step",
      eli_message: "Okay, ich zeige dir den Trick! Lass uns Schritt für Schritt gehen. 🚀",
      mood: "explaining",
      next_step: "step_by_step",
      should_reprompt: false,
    }
  }

  // KATEGORIE D – FOUNDATION GAP
  if (classification === "D") {
    const foundationList = foundationGaps?.join(", ") || "einer Grundlage"

    return {
      workflow: "foundation_gap",
      action: "create_bridge_tasks",
      eli_message: `Das ist gerade knifflig! Wir machen kurz ${foundationList} einfacher. 🤖`,
      mood: "explaining",
      next_step: "bridge_tasks",
      should_reprompt: false,
      data: {
        gaps: foundationGaps,
        bridge_count: 3,
      },
    }
  }

  // KATEGORIE E – PROBLEM NICHT VERSTANDEN
  if (classification === "E") {
    return {
      workflow: "clarify_problem",
      action: "simplify_and_clarify",
      eli_message: "Lass mich die Aufgabe anders erklären... 📚",
      mood: "explaining",
      next_step: "clarify_problem",
      should_reprompt: true,
    }
  }

  // KATEGORIE F – UNSICHERE ERKENNUNG
  if (classification === "F") {
    return {
      workflow: "confirm_input",
      action: "ask_for_clarification",
      eli_message: "Hmm, ich bin mir nicht sicher... Kannst du das nochmal überprüfen? 🤔",
      mood: "thinking",
      next_step: "confirm_input",
      should_reprompt: true,
    }
  }

  // Fallback
  return {
    workflow: "normal",
    action: "unknown",
    eli_message: "Versuch es nochmal! 💪",
    mood: "encouraging",
    next_step: "reprompt",
    should_reprompt: true,
  }
}

/**
 * Normal Flow - Standard progression (A/B/C)
 * User tries again or moves to next task
 */
export function getNormalFlowAction(
  classification: AnswerClassification,
  attemptCount: number
): string {
  if (classification === "A") return "celebrate_and_next"
  if (classification === "B" && attemptCount > 3) return "show_solution_and_next"
  if (classification === "C" && attemptCount > 2) return "show_solution_and_next"
  return "reprompt"
}

/**
 * Foundation Gap Flow - Bridge tasks then return
 * Creates intermediate tasks to build foundation
 */
export function getFoundationGapFlow(gaps: string[]): WorkflowDecision {
  return {
    workflow: "foundation_gap",
    action: "start_bridge_sequence",
    eli_message: `Wir starten mit etwas Leichterem - das hilft dir verstehen! 🌉`,
    mood: "encouraging",
    next_step: "bridge_task_1",
    should_reprompt: false,
    data: { gaps, bridge_index: 1 },
  }
}

/**
 * After Bridge Tasks Complete - Check mastery then retry original
 */
export function returnFromBridgeTasks(
  bridge_success_rate: number,
  original_task_id: string
): WorkflowDecision {
  return {
    workflow: "normal",
    action: "return_to_original",
    eli_message:
      bridge_success_rate > 0.8
        ? "Super! Du hast das verstanden! Jetzt versuchen wir die original Aufgabe nochmal! 💪"
        : "Gut gemacht! Lass uns die original Aufgabe langsam angehen. 📝",
    mood: bridge_success_rate > 0.8 ? "happy" : "encouraging",
    next_step: "original_task",
    should_reprompt: false,
    data: { original_task_id, bridge_success_rate },
  }
}

/**
 * Problem Clarification Flow (E)
 * Simplify and re-explain the problem
 */
export function getProblemClarificationFlow(
  original_problem: string
): WorkflowDecision {
  return {
    workflow: "clarify_problem",
    action: "simplify_problem",
    eli_message: "Okay, anders gesagt:\n\nWas musst du hier eigentlich MACHEN? 🤔",
    mood: "explaining",
    next_step: "reprompt",
    should_reprompt: true,
    data: { original_problem },
  }
}

/**
 * Input Confirmation Flow (F)
 * Ask user to confirm uncertain input
 */
export function getInputConfirmationFlow(
  uncertainty: string
): WorkflowDecision {
  return {
    workflow: "confirm_input",
    action: "confirm_recognition",
    eli_message: `Ist das eine ${uncertainty}? Sag Bescheid, dann machen wir weiter! 👉`,
    mood: "thinking",
    next_step: "confirm_input",
    should_reprompt: true,
    data: { uncertainty },
  }
}

/**
 * Track workflow state
 */
export interface WorkflowState {
  current_workflow: WorkflowType
  started_at: Date
  attempts_in_workflow: number
  classification_history: AnswerClassification[]
  task_id: string
  bridge_tasks?: string[] // IDs of bridge tasks completed
  can_return_to_original: boolean
}

/**
 * Should we advance to next task despite imperfect mastery?
 */
export function shouldAdvanceToNext(
  classification: AnswerClassification,
  attemptCount: number,
  helpLevelUsed: number
): boolean {
  // Perfect
  if (classification === "A" && helpLevelUsed === 0) return true

  // Good with minimal help
  if (classification === "A" && helpLevelUsed <= 1) return attemptCount < 3

  // Attempted 4+ times without getting it
  if (attemptCount >= 4) return true

  return false
}
