/**
 * School Topic Detector
 *
 * Erkennt, welche Themen aktuell in der Schule gelehrt werden
 * basierend auf hochgeladenen Materialien und Häufigkeit
 */

export interface SchoolTopicSignal {
  topicId: string
  topicName: string
  firstSeenAt: Date
  lastSeenAt: Date
  uploadFrequency: number // wie oft diese Woche/Monat
  recentTaskCount: number // Aufgaben der letzten 7 Tage
  relevanceScore: number // 0-100
  sources: string[] // "upload", "practice", "error"
  masteryLevel: number // 0-5
}

export interface CurrentSchoolTopics {
  primary: SchoolTopicSignal | null
  secondary: SchoolTopicSignal[]
  detected_at: Date
  confidence: number // 0-100
}

export class SchoolTopicDetector {
  /**
   * Erkennt aktuelle Schulthemen basierend auf:
   * - Recency (neueste Uploads zuerst)
   * - Frequency (wie oft dieses Thema auftaucht)
   * - Task Count (wieviele Aufgaben dazu)
   */
  static detectCurrentTopics(
    allTopicSignals: SchoolTopicSignal[]
  ): CurrentSchoolTopics {
    if (allTopicSignals.length === 0) {
      return {
        primary: null,
        secondary: [],
        detected_at: new Date(),
        confidence: 0,
      }
    }

    // Sortiere nach Relevanz: Recency + Frequency + Recent Tasks
    const scored = allTopicSignals.map((signal) => ({
      ...signal,
      relevanceScore: this.calculateRelevanceScore(signal),
    }))

    scored.sort((a, b) => b.relevanceScore - a.relevanceScore)

    const primary = scored[0] || null
    const secondary = scored.slice(1, 3) // Top 2 sekundär

    // Confidence: Wenn Primary Signal sehr stark, dann high confidence
    const confidence = primary ? Math.min(100, primary.relevanceScore + 20) : 0

    return {
      primary,
      secondary,
      detected_at: new Date(),
      confidence,
    }
  }

  /**
   * Berechnet Relevanz-Score für ein Topic Signal
   *
   * Faktoren:
   * - Wie neu ist das Topic? (lastSeenAt)
   * - Wie oft wurde es hochgeladen? (uploadFrequency)
   * - Wie viele Tasks in letzter Zeit? (recentTaskCount)
   * - Zeitverfall für alte Topics
   */
  private static calculateRelevanceScore(signal: SchoolTopicSignal): number {
    const now = new Date()
    const daysSinceLastSeen = (now.getTime() - signal.lastSeenAt.getTime()) / (1000 * 60 * 60 * 24)

    // Recency Score: 0-40 Punkte
    // Frisch (heute) = 40, vor 7 Tagen = 20, älter = 5
    let recencyScore = 5
    if (daysSinceLastSeen <= 1) recencyScore = 40
    else if (daysSinceLastSeen <= 3) recencyScore = 30
    else if (daysSinceLastSeen <= 7) recencyScore = 20
    else if (daysSinceLastSeen <= 14) recencyScore = 10

    // Frequency Score: 0-30 Punkte
    // Wie oft diese Woche? (uploadFrequency)
    let frequencyScore = Math.min(30, signal.uploadFrequency * 8)

    // Task Count Score: 0-20 Punkte
    // Wie viele aktuelle Tasks?
    let taskScore = Math.min(20, signal.recentTaskCount * 3)

    // Mastery Impact: -10 bis +10 Punkte
    // Sichere Topics bekommen Bonus (könnte Challenge sein)
    // Unsichere Topics bekommen Bonus (brauchen Training)
    let masteryBonus = 0
    if (signal.masteryLevel >= 4) masteryBonus = 5 // Sicher: kurze Wiederholung
    if (signal.masteryLevel <= 1) masteryBonus = 10 // Unsicher: braucht Training

    return recencyScore + frequencyScore + taskScore + masteryBonus
  }

  /**
   * Aktualisiert ein Topic Signal mit neuen Daten
   */
  static updateTopicSignal(
    signal: SchoolTopicSignal,
    newActivity: "upload" | "practice" | "error"
  ): SchoolTopicSignal {
    const now = new Date()

    return {
      ...signal,
      lastSeenAt: now,
      uploadFrequency: newActivity === "upload" ? signal.uploadFrequency + 1 : signal.uploadFrequency,
      recentTaskCount: (newActivity === "practice" || newActivity === "error")
        ? signal.recentTaskCount + 1
        : signal.recentTaskCount,
      sources: Array.from(new Set([...signal.sources, newActivity])),
    }
  }

  /**
   * Berechnet Zeit bis Topic als "veraltet" angesehen wird
   * (für Confidence Decay später)
   */
  static getTopicFreshnessStatus(signal: SchoolTopicSignal): "fresh" | "recent" | "stale" | "old" {
    const daysSinceLastSeen = (new Date().getTime() - signal.lastSeenAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceLastSeen <= 2) return "fresh"
    if (daysSinceLastSeen <= 7) return "recent"
    if (daysSinceLastSeen <= 21) return "stale"
    return "old"
  }
}
