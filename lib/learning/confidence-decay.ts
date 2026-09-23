/**
 * Confidence Decay System
 *
 * Mastery einer Skill sinkt langsam wenn nicht überprüft
 * NICHT: Hart zurücksetzen
 * SONDERN: Sanfte Confidence Abnahme
 *
 * Beispiel:
 * - Bruchrechnung vor 6 Wochen "secure" (Level 4)
 * - Nicht überprüft seitdem
 * - Confidence sinkt: 100% → 80% → 60% → 40%
 * - Nach kurzer Review-Aufgabe: Confidence zurück zu 100%
 */

export interface MasteryWithConfidence {
  skillId: string
  skillName: string
  masteryLevel: number // 0-5
  masteryConfidence: number // 0-100, wie sicher sind wir noch?
  lastReviewDate: Date
  daysSinceReview: number
  isDecaying: boolean
}

export interface ConfidenceDecayConfig {
  freshThresholdDays: number // 0-3 Tage: kein Decay
  recentThresholdDays: number // 4-7 Tage: minimal Decay
  staleThresholdDays: number // 8-21 Tage: moderate Decay
  oldThresholdDays: number // 22+ Tage: strong Decay
}

const DEFAULT_CONFIG: ConfidenceDecayConfig = {
  freshThresholdDays: 3,
  recentThresholdDays: 7,
  staleThresholdDays: 21,
  oldThresholdDays: 42,
}

export class ConfidenceDecayEngine {
  private config: ConfidenceDecayConfig

  constructor(config?: Partial<ConfidenceDecayConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Berechnet Confidence basierend auf Zeit seit Review
   */
  calculateConfidence(
    originalMasteryLevel: number,
    lastReviewDate: Date,
    originalConfidence: number = 100
  ): number {
    const daysSinceReview = this.getDaysSince(lastReviewDate)

    // Nicht unter Mastery Level sinken (aber auch nicht darüber)
    const minConfidence = originalMasteryLevel * 20 // Level 3 = min 60%

    if (daysSinceReview <= this.config.freshThresholdDays) {
      // Fresh: Kein Decay
      return Math.max(minConfidence, originalConfidence)
    }

    if (daysSinceReview <= this.config.recentThresholdDays) {
      // Recent: Minimal Decay (5%)
      const decayFactor = 0.95
      return Math.max(minConfidence, originalConfidence * decayFactor)
    }

    if (daysSinceReview <= this.config.staleThresholdDays) {
      // Stale: Moderate Decay (15%)
      const decayFactor = 0.85
      return Math.max(minConfidence, originalConfidence * decayFactor)
    }

    if (daysSinceReview <= this.config.oldThresholdDays) {
      // Old: Strong Decay (35%)
      const decayFactor = 0.65
      return Math.max(minConfidence, originalConfidence * decayFactor)
    }

    // Very Old: Significant Decay (50%)
    // Aber nicht unter Minimum
    const decayFactor = 0.5
    return Math.max(minConfidence, originalConfidence * decayFactor)
  }

  /**
   * Berechnet wie schnell Confidence verfällt
   * Verwendet exponentielles Decay Modell
   */
  calculateExponentialDecay(
    originalConfidence: number,
    daysSinceReview: number,
    decayRate: number = 0.02 // 2% pro Tag
  ): number {
    // C(t) = C0 * e^(-λt)
    // λ (lambda) = decay rate
    const decayedConfidence = originalConfidence * Math.exp(-decayRate * daysSinceReview)
    return Math.round(decayedConfidence)
  }

  /**
   * Gibt Freshness Status zurück
   */
  getConfidenceStatus(confidence: number): "confident" | "cautious" | "uncertain" | "very_uncertain" {
    if (confidence >= 80) return "confident"
    if (confidence >= 60) return "cautious"
    if (confidence >= 40) return "uncertain"
    return "very_uncertain"
  }

  /**
   * Prüft ob Skill "due for review" ist
   */
  isDueForReview(
    masteryLevel: number,
    confidence: number,
    daysSinceReview: number
  ): boolean {
    // Zu überprüfen wenn:
    // 1. Confidence unter 60% UND Mastery > 0
    // 2. ODER mehr als 14 Tage seit Review (für sichere Skills)
    // 3. ODER mehr als 7 Tage (für unsichere Skills)

    if (confidence < 60 && masteryLevel > 0) return true
    if (masteryLevel >= 4 && daysSinceReview > 14) return true
    if (masteryLevel < 4 && daysSinceReview > 7) return true

    return false
  }

  /**
   * Berechnet wie viele Review Tasks sollten geplant werden
   */
  calculateReviewTaskCount(
    masteryLevel: number,
    confidence: number,
    daysSinceReview: number
  ): number {
    const status = this.getConfidenceStatus(confidence)

    switch (status) {
      case "confident":
        // Nur kurze Aufgabe: 1
        return 1
      case "cautious":
        // Medium: 2
        return 2
      case "uncertain":
        // Mehr: 3
        return 3
      case "very_uncertain":
        // Viel: 4-5
        return Math.min(5, masteryLevel + 2)
    }
  }

  /**
   * Boost Confidence nach erfolgreicher Review
   */
  boostConfidenceAfterSuccessfulReview(
    currentConfidence: number,
    successRate: number // 0-1
  ): number {
    // Vollständig erfolgreich (100%) → Boost zu 100%
    // 75% erfolgreich → Boost zu 90%
    // 50% erfolgreich → Boost zu 70%

    if (successRate >= 0.9) {
      return 100
    }

    const boostAmount = successRate * 50 // 0-50% Boost
    return Math.min(100, currentConfidence + boostAmount)
  }

  /**
   * Reduziere Confidence nach Fehler
   */
  reduceConfidenceAfterFailure(
    currentConfidence: number,
    helpLevelUsed: number // 0-5
  ): number {
    // Ohne Hilfe: -10%
    // Mit Hilfe: -5% (wir wissen jetzt wo das Problem ist)
    const reduction = helpLevelUsed === 0 ? 10 : 5
    return Math.max(0, currentConfidence - reduction)
  }

  /**
   * Prüfe ob Mastery Level basierend auf Confidence rückgestuft werden sollte
   */
  shouldDowngradeLevel(
    currentLevel: number,
    confidence: number
  ): boolean {
    // Nur wenn Confidence sehr niedrig UND Level war hoch
    if (currentLevel >= 3 && confidence < 30) {
      return true
    }
    return false
  }

  /**
   * Gebe Recommendation basierend auf Decay
   */
  getReviewRecommendation(
    skillName: string,
    masteryLevel: number,
    confidence: number,
    daysSinceReview: number
  ): string {
    const status = this.getConfidenceStatus(confidence)

    if (status === "confident" && daysSinceReview <= 7) {
      return `✅ ${skillName} ist sicher. Kurze Wiederholung nächste Woche.`
    }

    if (status === "cautious" && daysSinceReview > 10) {
      return `⚠️ ${skillName} sollte bald überprüft werden (2-3 Aufgaben).`
    }

    if (status === "uncertain") {
      return `🔴 ${skillName} braucht sofort ein Review (3-5 Aufgaben).`
    }

    if (status === "very_uncertain") {
      return `🚨 ${skillName} sollte gründlich wiederholt werden (Bridge Task + 3+ Aufgaben).`
    }

    return `Check ${skillName}`
  }

  /**
   * Helper: Berechne Tage seit Datum
   */
  private getDaysSince(date: Date): number {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
}
