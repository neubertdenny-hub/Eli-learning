/**
 * Review Priority Engine
 *
 * Berechnet welche Skills am dringendsten überprüft werden sollten
 * basierend auf:
 * - Mastery Confidence Decay
 * - Fehlerhistorie
 * - Zeit seit letzter Review
 * - Bedeutung für aktuellen Schulstoff
 */

import { ConfidenceDecayEngine } from "./confidence-decay"
import { SkillMastery } from "./mastery-engine"

export interface ReviewPriority {
  skillId: string
  skillName: string
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW" | "SKIP"
  score: number // 0-100
  reason: string
  recommendedTaskCount: number
  confidence: number
  daysSinceReview: number
}

export class ReviewPriorityEngine {
  private decayEngine: ConfidenceDecayEngine

  constructor() {
    this.decayEngine = new ConfidenceDecayEngine()
  }

  /**
   * Berechnet Prioritäten für alle Skills
   */
  calculatePriorities(
    skills: SkillMastery[],
    currentSchoolTopics: string[] = []
  ): ReviewPriority[] {
    return skills
      .map((skill) => this.calculateSinglePriority(skill, currentSchoolTopics.includes(skill.skill_name)))
      .sort((a, b) => b.score - a.score)
  }

  /**
   * Berechnet Priorität für einzelne Skill
   */
  private calculateSinglePriority(
    skill: SkillMastery,
    isCurrentSchoolTopic: boolean
  ): ReviewPriority {
    const daysSinceReview = this.getDaysSince(new Date(skill.last_practiced))

    // Berechne Confidence mit Decay
    const confidence = this.decayEngine.calculateConfidence(
      skill.current_level,
      new Date(skill.last_practiced),
      100
    )

    // Score berechnen (0-100)
    let score = 0
    let reason = ""

    // 1. Confidence Factor (bis 40 Punkte)
    const confidenceFactor = (100 - confidence) * 0.4
    score += confidenceFactor

    // 2. Mastery Level Factor (bis 20 Punkte)
    // Unsichere Skills brauchen mehr Reviews
    const masteryFactor = (5 - skill.current_level) * 4
    score += masteryFactor

    // 3. Time Factor (bis 30 Punkte)
    // Länger her = höhere Priorität
    let timeFactor = 0
    if (daysSinceReview > 21) timeFactor = 30 // Very Old
    else if (daysSinceReview > 14) timeFactor = 25 // Old
    else if (daysSinceReview > 7) timeFactor = 15 // Stale
    else if (daysSinceReview > 3) timeFactor = 8 // Recent
    score += timeFactor

    // 4. Error History Factor (bis 20 Punkte)
    // Viele Fehler = höhere Priorität
    const errorRate = skill.correct_attempts > 0
      ? (skill.attempts - skill.correct_attempts) / skill.attempts
      : 0
    const errorFactor = errorRate * 20
    score += errorFactor

    // 5. School Topic Boost (bis 10 Punkte)
    // Wenn es aktueller Schulstoff ist: Boost
    if (isCurrentSchoolTopic) {
      score += 10
      reason = "Aktueller Schulstoff + Review fällig"
    }

    // Bestimme Priority Level
    let priority: "URGENT" | "HIGH" | "NORMAL" | "LOW" | "SKIP"
    if (score >= 80) {
      priority = "URGENT"
      if (!reason) reason = "Hohe Fehlerrate oder lange nicht überprüft"
    } else if (score >= 60) {
      priority = "HIGH"
      if (!reason) reason = "Mastery unsicher oder Zeit verstrichen"
    } else if (score >= 40) {
      priority = "NORMAL"
      if (!reason) reason = "Routine-Review fällig"
    } else if (score >= 20) {
      priority = "LOW"
      if (!reason) reason = "Kurzfristige Auffrischung"
    } else {
      priority = "SKIP"
      if (!reason) reason = "Gerade überprüft oder nicht nötig"
    }

    // Berechne empfohlene Aufgabenzahl
    const taskCount = this.decayEngine.calculateReviewTaskCount(
      skill.current_level,
      confidence,
      daysSinceReview
    )

    return {
      skillId: skill.skill_name,
      skillName: skill.skill_name,
      priority,
      score: Math.round(score),
      reason,
      recommendedTaskCount: taskCount,
      confidence: Math.round(confidence),
      daysSinceReview,
    }
  }

  /**
   * Filtere Skills nach Priority Level
   */
  filterByPriority(
    priorities: ReviewPriority[],
    priorityLevel: "URGENT" | "HIGH" | "NORMAL" | "LOW"
  ): ReviewPriority[] {
    const levels = {
      URGENT: ["URGENT"],
      HIGH: ["URGENT", "HIGH"],
      NORMAL: ["URGENT", "HIGH", "NORMAL"],
      LOW: ["URGENT", "HIGH", "NORMAL", "LOW"],
    }

    const allowed = levels[priorityLevel]
    return priorities.filter((p) => allowed.includes(p.priority))
  }

  /**
   * Wähle beste Skills für heute's Review
   */
  selectForTodaysReview(
    priorities: ReviewPriority[],
    targetTaskCount: number = 5
  ): ReviewPriority[] {
    // Nimm Skills in Priorität-Reihenfolge bis Task-Target erreicht
    const selected: ReviewPriority[] = []
    let tasksAdded = 0

    for (const priority of priorities) {
      if (priority.priority === "SKIP") continue

      selected.push(priority)
      tasksAdded += priority.recommendedTaskCount

      if (tasksAdded >= targetTaskCount) break
    }

    return selected
  }

  /**
   * Berechne wann nächste Review fällig ist
   */
  calculateNextReviewDate(
    masteryLevel: number,
    confidence: number
  ): Date {
    const now = new Date()

    // Basiert auf Confidence
    let daysUntilReview: number
    if (confidence >= 80) {
      daysUntilReview = 14 // 2 Wochen wenn confident
    } else if (confidence >= 60) {
      daysUntilReview = 7 // 1 Woche wenn cautious
    } else if (confidence >= 40) {
      daysUntilReview = 3 // 3 Tage wenn uncertain
    } else {
      daysUntilReview = 1 // Morgen wenn very uncertain
    }

    const nextReview = new Date(now.getTime() + daysUntilReview * 24 * 60 * 60 * 1000)
    return nextReview
  }

  /**
   * Ebbinghaus Spacing: Berechne optimale Review-Abstände
   *
   * Basierend auf Ebbinghaus Forgetting Curve:
   * - 1. Review: 1 Tag
   * - 2. Review: 3 Tage
   * - 3. Review: 1 Woche
   * - 4. Review: 2 Wochen
   * - 5. Review: 1 Monat
   */
  calculateEbbinghausSpacing(reviewCount: number): number {
    const spacings = [1, 3, 7, 14, 30]
    return spacings[Math.min(reviewCount, spacings.length - 1)]
  }

  /**
   * Helper: Tage seit Datum
   */
  private getDaysSince(date: Date): number {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * Summary für Parent Dashboard
   */
  generateReviewSummary(priorities: ReviewPriority[]): string {
    const urgent = priorities.filter((p) => p.priority === "URGENT").length
    const high = priorities.filter((p) => p.priority === "HIGH").length
    const normal = priorities.filter((p) => p.priority === "NORMAL").length

    let summary = ""
    if (urgent > 0) summary += `🚨 ${urgent} Skills brauchen sofort Review. `
    if (high > 0) summary += `⚠️ ${high} Skills sollten bald überprüft werden. `
    if (normal > 0 && urgent === 0) summary += `✅ ${normal} Skills zur Routine-Auffrischung. `

    if (!summary) summary = "✅ Alle Skills sind auf dem neuesten Stand!"

    return summary.trim()
  }
}
