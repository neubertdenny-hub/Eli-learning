/**
 * Phase 9H: Decision Transparency
 * Explain why ELI made each adaptive decision
 */

import { getDatabase } from "@/lib/db/connection"
import { adaptiveDecisions } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export interface DecisionExplanation {
  decisionId: string
  decision: string
  reason: string
  evidence: string[]
  confidence: number
  alternatives?: string[]
  timestamp: string
}

/**
 * Get explanation for a specific decision
 */
export async function explainDecision(
  userId: string,
  decisionId: string
): Promise<DecisionExplanation> {
  const db = getDatabase()

  const decision = await db
    .select()
    .from(adaptiveDecisions)
    .where(eq(adaptiveDecisions.id, decisionId))
    .limit(1)

  if (!decision || decision.length === 0) {
    throw new Error("Decision not found")
  }

  const d = decision[0]
  const explanation = generateExplanation(d)

  return explanation
}

/**
 * Get all recent decisions with explanations
 */
export async function getRecentDecisionsWithExplanations(
  userId: string,
  limit: number = 10
): Promise<DecisionExplanation[]> {
  const db = getDatabase()

  const decisions = await db
    .select()
    .from(adaptiveDecisions)
    .where(eq(adaptiveDecisions.userId, userId))
    .orderBy(desc(adaptiveDecisions.createdAt))
    .limit(limit)

  return decisions.map((d) => generateExplanation(d))
}

/**
 * Generate human-readable explanation for a decision
 */
function generateExplanation(decision: any): DecisionExplanation {
  const reasonCode = decision.reasonCode || "UNKNOWN"
  const confidence =
    decision.confidenceScore || calculateConfidence(decision)

  const explanations: Record<string, string> = {
    INDEPENDENT_SUCCESS: "Zoey hat das richtig gemacht - weitermachen!",
    NEEDS_HELP: "Zoey brauchte Hilfe - nächste Aufgabe zeigt es Schritt-für-Schritt",
    FOUNDATION_GAP: "Grundlagen-Lücke erkannt - wir bauen ein Review ein",
    TRANSFER_READY:
      "Zoey versteht es - jetzt Anwendung in neuer Situation üben",
    DIFFICULTY_TOO_HIGH: "Zu schwer - Schwierigkeit reduzieren",
    DIFFICULTY_TOO_LOW: "Zu leicht - schwieriger machen",
    REPEATED_ERROR: "Fehler wiederholt sich - andere Strategie versuchen",
    FORGETTING: "Zoey hat es vergessen - wiederholen",
    TRANSFER_FAILURE: "Transfer-Aufgabe fehlgeschlagen - Grund analysieren",
  }

  const evidence = [
    decision.topicId ? `Thema: ${decision.topicId}` : null,
    decision.attemptCount ? `${decision.attemptCount} Versuche` : null,
    decision.helpLevel ? `Hilfelevel: ${decision.helpLevel}` : null,
    confidence > 0.8 ? `Hohe Konfidenz (${(confidence * 100).toFixed(0)}%)` : null,
  ].filter(Boolean) as string[]

  return {
    decisionId: decision.id,
    decision: `Aufgabe: ${decision.topicId || "Unknown"}`,
    reason: explanations[reasonCode] || `Grund: ${reasonCode}`,
    evidence,
    confidence,
    alternatives: getAlternatives(reasonCode),
    timestamp: decision.createdAt,
  }
}

/**
 * Show alternative decisions that were considered
 */
function getAlternatives(reasonCode: string): string[] {
  const alternatives: Record<string, string[]> = {
    NEEDS_HELP: [
      "Könnte: vollständig gelöste Beispiel zeigen",
      "Könnte: Aufgabe in kleinere Teile zerlegen",
      "Könnte: mit Zahlenstrahl-Visualisierung helfen",
    ],
    FOUNDATION_GAP: [
      "Könnte: direkt weitergehen und später testen",
      "Könnte: mit leichterer Aufgabe starten",
    ],
    DIFFICULTY_TOO_HIGH: [
      "Könnte: neues Strategieformat versuchen",
      "Könnte: interaktive Visualisierung nutzen",
    ],
    TRANSFER_FAILURE: [
      "Könnte: Brückenaufgabe zum Transfer bauen",
      "Könnte: Grundlagen nochmal üben",
    ],
  }

  return alternatives[reasonCode] || []
}

/**
 * Calculate confidence based on data points
 */
function calculateConfidence(decision: any): number {
  const factors = [
    decision.strategySampleSize ? Math.min(decision.strategySampleSize / 10, 1) : 0.3,
    decision.helpLevel ? 0.2 : 0,
    decision.attemptCount ? Math.min(decision.attemptCount / 5, 0.2) : 0,
  ]

  return Math.min(1, factors.reduce((a, b) => a + b, 0))
}
