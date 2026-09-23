/**
 * Foundation Gap Detector
 * Identifies which mathematical foundations are missing
 * Based on answer classification and error patterns
 */

import { AnswerClassification } from "@/lib/ai/schemas"

// Die 12 Mathematical Foundations
export const MATH_FOUNDATIONS = {
  // Basic Arithmetic
  addition: "Grundrechenarten: Addition",
  subtraction: "Grundrechenarten: Subtraktion",
  multiplication: "Grundrechenarten: Multiplikation",
  division: "Grundrechenarten: Division",

  // Numbers
  negative_numbers: "Negative Zahlen",
  decimal_numbers: "Dezimalzahlen",

  // Fractions
  fractions: "Bruchrechnung",
  fraction_simplification: "Brüche kürzen",

  // Advanced
  equations: "Gleichungen",
  percentages: "Prozentrechnung",
  order_of_operations: "Rechenreihenfolge & Klammern",
  geometry: "Geometrische Grundlagen",
} as const

export type FoundationKey = keyof typeof MATH_FOUNDATIONS

export interface FoundationGap {
  foundation_key: FoundationKey
  confidence: number
  reasoning: string
}

export interface GapDetectionResult {
  has_gap: boolean
  gaps: FoundationGap[]
  severity: "low" | "medium" | "high"
}

/**
 * Detect foundation gaps from OpenAI classification
 * This should be called when classification === 'D'
 */
export async function detectFoundationGaps(
  problem: string,
  userAnswer: string,
  correctSolution: string,
  classification: AnswerClassification,
  openaiFoundationGaps?: string[]
): Promise<GapDetectionResult> {
  // Wenn OpenAI foundation_gaps bereits erkannt hat, nutze diese
  if (openaiFoundationGaps && openaiFoundationGaps.length > 0) {
    return {
      has_gap: true,
      gaps: openaiFoundationGaps.map((key) => ({
        foundation_key: key as FoundationKey,
        confidence: 0.85,
        reasoning: `OpenAI detected: ${MATH_FOUNDATIONS[key as FoundationKey]}`,
      })),
      severity: "high",
    }
  }

  // Fallback: Local pattern matching
  const detectedGaps: FoundationGap[] = []

  // Check für negative Zahlen Fehler
  if (containsNegativeNumbers(problem) && hasSignError(userAnswer, correctSolution)) {
    detectedGaps.push({
      foundation_key: "negative_numbers",
      confidence: 0.9,
      reasoning: "Sign error detected - likely negative number understanding",
    })
  }

  // Check für Dezimalzahlen Fehler
  if (containsDecimals(problem) && hasDecimalError(userAnswer, correctSolution)) {
    detectedGaps.push({
      foundation_key: "decimal_numbers",
      confidence: 0.85,
      reasoning: "Decimal point error detected",
    })
  }

  // Check für Bruch-Fehler
  if (containsFractions(problem) && hasFractionError(userAnswer, correctSolution)) {
    detectedGaps.push({
      foundation_key: "fractions",
      confidence: 0.8,
      reasoning: "Fraction calculation error detected",
    })
  }

  // Check für Rechenreihenfolge Fehler
  if (requiresOrderOfOperations(problem) && hasOrderError(userAnswer, correctSolution)) {
    detectedGaps.push({
      foundation_key: "order_of_operations",
      confidence: 0.75,
      reasoning: "Order of operations not followed correctly",
    })
  }

  return {
    has_gap: detectedGaps.length > 0,
    gaps: detectedGaps,
    severity: detectedGaps.length > 0 ? "high" : "low",
  }
}

// ========== PATTERN MATCHERS ==========

function containsNegativeNumbers(text: string): boolean {
  return /[-−]\s*\d|negative|minus|minus/i.test(text)
}

function containsDecimals(text: string): boolean {
  return /\d+[,\.]\d+|decimal|komma/i.test(text)
}

function containsFractions(text: string): boolean {
  return /\/|\d+\/\d+|bruch|fraction/i.test(text)
}

function requiresOrderOfOperations(text: string): boolean {
  return /[+\-*/].*[+\-*/]|klammer|\(|^\s*\d+\s*[+\-*/].*[+\-*/]/i.test(text)
}

function hasSignError(userAnswer: string, correctSolution: string): boolean {
  const userNum = parseFloat(userAnswer.toString())
  const correctNum = parseFloat(correctSolution.toString())

  // Falsches Vorzeichen
  return userNum === -correctNum
}

function hasDecimalError(userAnswer: string, correctSolution: string): boolean {
  const userStr = userAnswer.toString().replace(/,/, ".")
  const correctStr = correctSolution.toString().replace(/,/, ".")

  // Dezimalpunkt an falscher Stelle (z.B. 1.23 statt 12.3)
  return (
    userStr.replace(/[.,]/g, "") === correctStr.replace(/[.,]/g, "") &&
    userStr !== correctStr
  )
}

function hasFractionError(userAnswer: string, correctSolution: string): boolean {
  // Vereinfacht: Wenn Antwort nahe bei korrekter ist aber nicht exakt
  const userNum = parseFloat(userAnswer.toString())
  const correctNum = parseFloat(correctSolution.toString())

  // Fehler zwischen 0.01 und 0.5 deutet auf Bruch-Verständnis hin
  const diff = Math.abs(userNum - correctNum)
  return diff > 0.01 && diff < 0.5
}

function hasOrderError(userAnswer: string, correctSolution: string): boolean {
  // Wenn Antwort stark abweicht, könnte Rechenreihenfolge falsch sein
  const userNum = parseFloat(userAnswer.toString())
  const correctNum = parseFloat(correctSolution.toString())

  const diff = Math.abs(userNum - correctNum)
  return diff > 1 && userNum !== correctNum
}

/**
 * Get bridge tasks for a foundation gap
 * Returns difficulty progression
 */
export function getBridgeTaskDifficulty(
  original_difficulty: number,
  gap_severity: "low" | "medium" | "high"
): {
  bridge1_difficulty: number
  bridge2_difficulty: number
  bridge3_difficulty: number
} {
  // Für high severity: viel einfacher anfangen
  if (gap_severity === "high") {
    return {
      bridge1_difficulty: Math.max(1, original_difficulty - 2),
      bridge2_difficulty: Math.max(1, original_difficulty - 1),
      bridge3_difficulty: original_difficulty,
    }
  }

  if (gap_severity === "medium") {
    return {
      bridge1_difficulty: Math.max(1, original_difficulty - 1),
      bridge2_difficulty: original_difficulty,
      bridge3_difficulty: original_difficulty + 1,
    }
  }

  // low severity
  return {
    bridge1_difficulty: original_difficulty,
    bridge2_difficulty: original_difficulty + 1,
    bridge3_difficulty: original_difficulty + 2,
  }
}
