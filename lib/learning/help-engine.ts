/**
 * Help Level Engine
 * Generates adaptive help (Level 0-5) based on answer classification and history
 */

import { AnswerClassification } from "@/lib/ai/schemas"

export type HelpLevel = 0 | 1 | 2 | 3 | 4 | 5

export interface HelpContext {
  classification: AnswerClassification
  attemptCount: number
  previousHelpLevels: HelpLevel[]
  confidence: number
  errorType?: string
}

export interface HelpOutput {
  recommendedLevel: HelpLevel
  eliMessage: string
  mood: "happy" | "explaining" | "encouraging" | "thinking"
  shouldReprompt: boolean
}

/**
 * Help Level 0: No help - Zoey solves independently
 * Help Level 1: Very small hint (school hint)
 * Help Level 2: Direction (which operation/step)
 * Help Level 3: Principle explanation (simple)
 * Help Level 4: Step-by-step together (Zoey answers questions)
 * Help Level 5: Complete explanation + solution walkthrough
 */

export function determineHelpLevel(context: HelpContext): HelpOutput {
  const { classification, attemptCount, previousHelpLevels, confidence, errorType } = context

  // KATEGORIE A – RICHTIG
  if (classification === "A") {
    return {
      recommendedLevel: 0,
      eliMessage: "✅ Richtig! Du bist ja clever! 🎉",
      mood: "happy",
      shouldReprompt: false,
    }
  }

  // KATEGORIE B – KLEINER FEHLER
  if (classification === "B") {
    // First attempt: very small hint
    if (attemptCount === 1 && previousHelpLevels.length === 0) {
      return {
        recommendedLevel: 1,
        eliMessage: "Fast richtig! Schau nochmal auf ein Detail... 👀",
        mood: "encouraging",
        shouldReprompt: true,
      }
    }

    // Second attempt: direction
    if (attemptCount === 2) {
      if (errorType === "sign_error") {
        return {
          recommendedLevel: 2,
          eliMessage: "Denk an das Minuszeichen! Was ändert sich da? 🤔",
          mood: "encouraging",
          shouldReprompt: true,
        }
      }
      if (errorType === "careless_mistake") {
        return {
          recommendedLevel: 2,
          eliMessage: "Nochmal nachgerechnet? Schau auf die Zahlen! 🔍",
          mood: "encouraging",
          shouldReprompt: true,
        }
      }
    }

    // Third+ attempt: simple explanation
    return {
      recommendedLevel: 3,
      eliMessage: "Lass mich dir helfen. Das ist der Trick: Überprüf jede Zahl! 📝",
      mood: "explaining",
      shouldReprompt: true,
    }
  }

  // KATEGORIE C – MITTLERER FEHLER
  if (classification === "C") {
    if (attemptCount === 1) {
      return {
        recommendedLevel: 2,
        eliMessage: "Hmm, ein Schritt passt nicht. Welcher denn? 🤨",
        mood: "thinking",
        shouldReprompt: true,
      }
    }

    if (attemptCount === 2) {
      return {
        recommendedLevel: 3,
        eliMessage: `Dieser Schritt ist wichtig: Du brauchst zuerst das. Versuch nochmal! 📖`,
        mood: "explaining",
        shouldReprompt: true,
      }
    }

    // Multiple attempts: step by step
    return {
      recommendedLevel: 4,
      eliMessage: "Okay, wir machen Schritt für Schritt. Los geht's! 🚀",
      mood: "explaining",
      shouldReprompt: false,
    }
  }

  // KATEGORIE D – FOUNDATION GAP
  if (classification === "D") {
    return {
      recommendedLevel: 4,
      eliMessage: "Das ist gerade knifflig. Wir machen kurz etwas Leichteres. 🤖",
      mood: "explaining",
      shouldReprompt: false,
    }
  }

  // KATEGORIE E – PROBLEM NICHT VERSTANDEN
  if (classification === "E") {
    return {
      recommendedLevel: 2,
      eliMessage: "Lass mich die Aufgabe anders erklären. Die Frage ist... 📚",
      mood: "explaining",
      shouldReprompt: true,
    }
  }

  // KATEGORIE F – UNSICHERE ERKENNUNG
  if (classification === "F") {
    return {
      recommendedLevel: 1,
      eliMessage: "Ist das eine 3 oder eine 8? 🤔 Sag mir Bescheid!",
      mood: "thinking",
      shouldReprompt: true,
    }
  }

  // Fallback
  return {
    recommendedLevel: 0,
    eliMessage: "Versuch es nochmal! 💪",
    mood: "encouraging",
    shouldReprompt: true,
  }
}

/**
 * Check if answer should be accepted despite help level
 * Mit Hilfe gelöst = nicht beherrscht
 */
export function shouldUpdateMastery(
  isCorrect: boolean,
  helpLevel: HelpLevel,
  previousIndependentSuccesses: number
): boolean {
  // Level 0 (keine Hilfe) + richtig = Mastery kann steigen
  if (isCorrect && helpLevel === 0) {
    return true
  }

  // Level 1-2 (kleine Hilfen) + richtig = Mastery schwach steigen
  if (isCorrect && helpLevel <= 2 && previousIndependentSuccesses > 2) {
    return true
  }

  // Level 3+ = nicht für Mastery zählen
  return false
}

/**
 * Generate next step suggestion based on classification
 */
export function getNextStep(classification: AnswerClassification): string {
  switch (classification) {
    case "A":
      return "next_task" // Move to next task
    case "B":
      return "reprompt" // Same task, try again
    case "C":
      return "reprompt" // Same task with explanation
    case "D":
      return "bridge_task" // Easier task first
    case "E":
      return "clarify_problem" // Explain problem again
    case "F":
      return "confirm_input" // Ask for clarification
    default:
      return "reprompt"
  }
}
