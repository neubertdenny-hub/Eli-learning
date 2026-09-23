/**
 * Bridge Task Generator
 * Generates simpler tasks to fill foundation gaps
 * Creates task progression: Easy → Medium → Original
 */

import { FoundationKey, MATH_FOUNDATIONS } from "./foundation-gap-detector"

export interface BridgeTask {
  id: string
  foundation: FoundationKey
  difficulty: 1 | 2 | 3 | 4 | 5
  problem_statement: string
  solution: string
  solution_steps?: string[]
  explanation: string
  is_bridge: true
  bridge_sequence: number // 1, 2, or 3
}

export interface BridgeTaskSet {
  original_task_id: string
  foundation: FoundationKey
  tasks: BridgeTask[]
  estimated_time_minutes: number
}

const BRIDGE_EXAMPLES: Record<FoundationKey, string[][]> = {
  addition: [
    ["2 + 3", "5"],
    ["5 + 7", "12"],
    ["23 + 14", "37"],
  ],
  subtraction: [
    ["5 - 2", "3"],
    ["10 - 3", "7"],
    ["25 - 12", "13"],
  ],
  multiplication: [
    ["2 × 3", "6"],
    ["4 × 5", "20"],
    ["7 × 8", "56"],
  ],
  division: [
    ["6 ÷ 2", "3"],
    ["12 ÷ 3", "4"],
    ["20 ÷ 4", "5"],
  ],
  negative_numbers: [
    ["-2 + 3", "1"],
    ["-5 + 2", "-3"],
    ["-4 + 1", "-3"],
  ],
  decimal_numbers: [
    ["1,5 + 2,5", "4"],
    ["3,2 + 1,1", "4,3"],
    ["2,5 × 2", "5"],
  ],
  fractions: [
    ["1/2 + 1/2", "1"],
    ["1/4 + 1/4", "1/2"],
    ["3/4 - 1/4", "1/2"],
  ],
  fraction_simplification: [
    ["2/4 = ?", "1/2"],
    ["3/6 = ?", "1/2"],
    ["4/8 = ?", "1/2"],
  ],
  equations: [
    ["x + 2 = 5, x = ?", "3"],
    ["x - 1 = 3, x = ?", "4"],
    ["2x = 10, x = ?", "5"],
  ],
  percentages: [
    ["50% von 100 = ?", "50"],
    ["25% von 100 = ?", "25"],
    ["10% von 50 = ?", "5"],
  ],
  order_of_operations: [
    ["2 + 3 × 2 = ?", "8"],
    ["(2 + 3) × 2 = ?", "10"],
    ["10 - 2 × 3 = ?", "4"],
  ],
  geometry: [
    ["Rechteck: L=4cm, B=2cm. Umfang = ?", "12"],
    ["Quadrat: S=3cm. Fläche = ?", "9"],
    ["Kreis: r=2cm. Umfang ≈ ? (π≈3,14)", "12,56"],
  ],
}

/**
 * Generate bridge task set for a foundation gap
 */
export async function generateBridgeTasks(
  foundation: FoundationKey,
  original_difficulty: number,
  original_task_id: string
): Promise<BridgeTaskSet> {
  const bridgeTasks: BridgeTask[] = []

  // Get example tasks for this foundation
  const examples = BRIDGE_EXAMPLES[foundation]
  if (!examples) {
    throw new Error(`No bridge task examples for foundation: ${foundation}`)
  }

  // Create 3 bridge tasks (easy → medium → original difficulty)
  for (let sequence = 1; sequence <= 3; sequence++) {
    const difficulty = Math.min(5, original_difficulty - (4 - sequence)) as 1 | 2 | 3 | 4 | 5
    const example = examples[Math.min(sequence - 1, examples.length - 1)]

    if (!example) continue

    const task: BridgeTask = {
      id: `bridge_${original_task_id}_${foundation}_${sequence}`,
      foundation,
      difficulty,
      problem_statement: example[0],
      solution: example[1],
      explanation: generateExplanation(foundation, example[0]),
      is_bridge: true,
      bridge_sequence: sequence,
    }

    bridgeTasks.push(task)
  }

  return {
    original_task_id,
    foundation,
    tasks: bridgeTasks,
    estimated_time_minutes: bridgeTasks.length * 3, // ~3 min per task
  }
}

/**
 * Generate simple explanation for bridge task
 */
function generateExplanation(foundation: FoundationKey, problem: string): string {
  const explanations: Record<FoundationKey, string> = {
    addition: "Zähle die Zahlen zusammen! Start bei der ersten Zahl und zähle die zweite dazu.",
    subtraction:
      "Ziehe die zweite Zahl von der ersten ab! Wie viel bleibt übrig?",
    multiplication: "Multiplikation heißt: wiederholt addieren! 3 × 2 bedeutet: 3 + 3.",
    division: "Division heißt: teilen! Wie viele Gruppen entstehen?",
    negative_numbers:
      "Negative Zahlen sind unter Null! Auf der Zahlengeraden nach links.",
    decimal_numbers:
      "Dezimalzahlen haben Komma-Stellen! Rechne wie normal, aber achte auf das Komma.",
    fractions: "Brüche sind Teile! 1/2 bedeutet: eine von zwei Teilen.",
    fraction_simplification: "Kürzen bedeutet: beide Seiten durch die gleiche Zahl teilen.",
    equations: "In einer Gleichung musst du x finden! Was müssen wir mit x machen?",
    percentages:
      "Prozente sind Teile von 100! 50% = die Hälfte, 25% = ein Viertel.",
    order_of_operations: "Erst Multiplikation, dann Addition! Das ist die Regel.",
    geometry: "Geometrie ist Formen! Rechteck, Kreis, Dreieck...",
  }

  return explanations[foundation] || "Versuch diesen Schritt!"
}

/**
 * Should we create bridge tasks?
 * Returns true if it's worth it given the gap severity
 */
export function shouldCreateBridgeTasks(
  classification: string,
  gap_severity: "low" | "medium" | "high"
): boolean {
  // Nur für Classification D (Foundation Gap)
  if (classification !== "D") {
    return false
  }

  // Auch bei low severity könnte helfen, aber high/medium sind vorrang
  return gap_severity === "high" || gap_severity === "medium"
}
