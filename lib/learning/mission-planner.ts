/**
 * Mission Planner
 *
 * Erstellt automatisch eine persönliche ~20-Minuten Mission für Zoey
 * basierend auf:
 * - Aktuellem Schulstoff
 * - Foundation Gaps
 * - Fälligen Reviews
 * - Mastery Levels
 * - Eli Memory
 */

import { SkillMastery } from "./mastery-engine"
import { CurrentSchoolTopics } from "./school-topic-detector"

export type MissionBlockType =
  | "WARM_UP"
  | "CURRENT_SCHOOL_TOPIC"
  | "FOUNDATION_REPAIR"
  | "REVIEW"
  | "PRACTICE"
  | "CHALLENGE"
  | "TRANSFER_CHECK"
  | "DIAGNOSIS"

export type SelectionReason =
  | "CURRENT_SCHOOL_TOPIC"
  | "FOUNDATION_GAP"
  | "REVIEW_DUE"
  | "REPEATED_ERROR"
  | "LOW_MASTERY"
  | "CONFIDENCE_DECAY"
  | "TRANSFER_CHECK"
  | "CHALLENGE"
  | "WARM_UP"

export interface MissionBlock {
  id: string
  type: MissionBlockType
  order: number
  topicId: string
  topicName: string
  targetTaskCount: number
  completedTaskCount: number
  estimatedMinutes: number
  selectionReason: SelectionReason
  status: "pending" | "in_progress" | "completed" | "skipped"
}

export interface DailyMission {
  id: string
  userId: string
  date: Date
  blocks: MissionBlock[]
  targetMinutes: number
  selectionReasoning: string // Erklärtext für Parent Dashboard
  status: "planned" | "in_progress" | "completed" | "paused"
  startedAt?: Date
  completedAt?: Date
  activeLearningSeconds: number
  xpEarned: number
}

export interface ReviewPriority {
  skillId: string
  skillName: string
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW"
  daysSinceReview: number
  masteryConfidence: number
  errorRate: number
  consecutiveFailures: number
  foundationImportance: "critical" | "high" | "medium" | "low"
}

export class MissionPlanner {
  /**
   * Hauptfunktion: Erstellt eine persönliche Tagesmission
   */
  static buildDailyMission(
    userId: string,
    currentSchoolTopics: CurrentSchoolTopics,
    masteryData: SkillMastery[],
    detectedGaps: string[], // Foundation Gaps aus letzten Sessions
    reviewDueSkills: string[], // Fällige Reviews
    recentErrors: Map<string, number>, // Skill -> Error Count
    eliMemory: any // Personalisiertes Memory
  ): DailyMission {
    const blocks: MissionBlock[] = []
    const targetMinutes = 20
    let currentMinutes = 0
    let blockOrder = 0

    // 1. WARM_UP (2-3 Min) - optional
    // Schneller Einstieg mit einfacher Wiederholung
    const warmUpBlock = this.createWarmUpBlock(masteryData)
    if (warmUpBlock && currentMinutes < targetMinutes) {
      blocks.push({ ...warmUpBlock, order: blockOrder++ })
      currentMinutes += warmUpBlock.estimatedMinutes
    }

    // 2. CURRENT_SCHOOL_TOPIC (8-10 Min) - PRIORITÄT 1
    // Aktuelle Schulaufgaben bekommen meiste Zeit
    if (currentSchoolTopics.primary && currentMinutes < targetMinutes - 5) {
      const schoolBlock = this.createCurrentSchoolBlock(
        currentSchoolTopics.primary,
        Math.min(10, targetMinutes - currentMinutes - 5)
      )
      blocks.push({ ...schoolBlock, order: blockOrder++ })
      currentMinutes += schoolBlock.estimatedMinutes
    }

    // 3. FOUNDATION_REPAIR (3-4 Min) - PRIORITÄT 2
    // Wenn Foundation Gap kritisch ist
    const foundationBlock = this.createFoundationBlock(detectedGaps, masteryData)
    if (foundationBlock && currentMinutes < targetMinutes - 3) {
      blocks.push({ ...foundationBlock, order: blockOrder++ })
      currentMinutes += foundationBlock.estimatedMinutes
    }

    // 4. REVIEW (2-3 Min) - PRIORITÄT 3
    // Fällige Wiederholungen
    const reviewBlock = this.createReviewBlock(
      reviewDueSkills,
      masteryData,
      Math.min(3, targetMinutes - currentMinutes - 2)
    )
    if (reviewBlock && currentMinutes < targetMinutes - 2) {
      blocks.push({ ...reviewBlock, order: blockOrder++ })
      currentMinutes += reviewBlock.estimatedMinutes
    }

    // 5. CHALLENGE (1-2 Min) - PRIORITÄT 5
    // Wenn noch Zeit und alles gut läuft
    if (currentMinutes < targetMinutes - 1) {
      const challengeBlock = this.createChallengeBlock(masteryData)
      if (challengeBlock) {
        blocks.push({ ...challengeBlock, order: blockOrder++ })
        currentMinutes += challengeBlock.estimatedMinutes
      }
    }

    const mission: DailyMission = {
      id: `mission_${userId}_${new Date().toISOString().split("T")[0]}`,
      userId,
      date: new Date(),
      blocks,
      targetMinutes,
      selectionReasoning: this.generateReasoningText(blocks, currentSchoolTopics),
      status: "planned",
      activeLearningSeconds: 0,
      xpEarned: 0,
    }

    return mission
  }

  /**
   * WARM-UP Block: Schnelle Wiederholung einer sicheren Skill
   */
  private static createWarmUpBlock(masteryData: SkillMastery[]): MissionBlock | null {
    const safeSkills = masteryData.filter((s) => s.current_level >= 3)
    if (safeSkills.length === 0) return null

    // Nimm eine zufällig sichere Skill
    const skill = safeSkills[Math.floor(Math.random() * safeSkills.length)]

    return {
      id: `block_warmup_${skill.skill_name}`,
      type: "WARM_UP",
      order: 0,
      topicId: skill.skill_name,
      topicName: `Wiederholung: ${skill.skill_name}`,
      targetTaskCount: 2,
      completedTaskCount: 0,
      estimatedMinutes: 2,
      selectionReason: "WARM_UP",
      status: "pending",
    }
  }

  /**
   * CURRENT_SCHOOL_TOPIC Block: Hauptthema der Schulwoche
   */
  private static createCurrentSchoolBlock(topic: any, availableMinutes: number): MissionBlock {
    return {
      id: `block_school_${topic.topicId}`,
      type: "CURRENT_SCHOOL_TOPIC",
      order: 1,
      topicId: topic.topicId,
      topicName: topic.topicName,
      targetTaskCount: Math.ceil(availableMinutes / 2.5), // ~2.5 Min pro Aufgabe
      completedTaskCount: 0,
      estimatedMinutes: availableMinutes,
      selectionReason: "CURRENT_SCHOOL_TOPIC",
      status: "pending",
    }
  }

  /**
   * FOUNDATION_REPAIR Block: Grundlagen-Lücken schließen
   */
  private static createFoundationBlock(gaps: string[], masteryData: SkillMastery[]): MissionBlock | null {
    if (gaps.length === 0) return null

    // Wähle kritischste Gap
    const criticalGap = gaps[0]
    const gapSkill = masteryData.find((s) => s.skill_name === criticalGap)

    if (!gapSkill) return null

    return {
      id: `block_foundation_${criticalGap}`,
      type: "FOUNDATION_REPAIR",
      order: 2,
      topicId: criticalGap,
      topicName: `Grundlage: ${criticalGap}`,
      targetTaskCount: 2,
      completedTaskCount: 0,
      estimatedMinutes: 3,
      selectionReason: "FOUNDATION_GAP",
      status: "pending",
    }
  }

  /**
   * REVIEW Block: Fällige Wiederholungen
   */
  private static createReviewBlock(
    reviewDueSkills: string[],
    masteryData: SkillMastery[],
    availableMinutes: number
  ): MissionBlock | null {
    if (reviewDueSkills.length === 0) return null

    // Nimm die erste fällige
    const skillToReview = reviewDueSkills[0]
    const reviewSkill = masteryData.find((s) => s.skill_name === skillToReview)

    if (!reviewSkill) return null

    return {
      id: `block_review_${skillToReview}`,
      type: "REVIEW",
      order: 3,
      topicId: skillToReview,
      topicName: `Wiederholung: ${skillToReview}`,
      targetTaskCount: 1,
      completedTaskCount: 0,
      estimatedMinutes: Math.min(3, availableMinutes),
      selectionReason: "REVIEW_DUE",
      status: "pending",
    }
  }

  /**
   * CHALLENGE Block: Schwierigere Aufgabe wenn Zeit übrig
   */
  private static createChallengeBlock(masteryData: SkillMastery[]): MissionBlock | null {
    // Wähle ein Topic bei dem Zoey sicher ist, aber nicht perfekt
    const challengeCandidate = masteryData.find((s) => s.current_level >= 2 && s.current_level < 5)

    if (!challengeCandidate) return null

    return {
      id: `block_challenge_${challengeCandidate.skill_name}`,
      type: "CHALLENGE",
      order: 4,
      topicId: challengeCandidate.skill_name,
      topicName: `Challenge: ${challengeCandidate.skill_name}`,
      targetTaskCount: 1,
      completedTaskCount: 0,
      estimatedMinutes: 2,
      selectionReason: "CHALLENGE",
      status: "pending",
    }
  }

  /**
   * Generiert Erklärtext für Parent Dashboard
   * "Warum hat ELI diese Mission ausgewählt?"
   */
  private static generateReasoningText(
    blocks: MissionBlock[],
    currentSchoolTopics: CurrentSchoolTopics
  ): string {
    const reasons: string[] = []

    if (currentSchoolTopics.primary) {
      reasons.push(`📚 ${currentSchoolTopics.primary.topicName} ist aktueller Schulstoff`)
    }

    if (blocks.some((b) => b.type === "FOUNDATION_REPAIR")) {
      reasons.push("🔧 Grundlage wird heute trainiert")
    }

    if (blocks.some((b) => b.type === "REVIEW")) {
      reasons.push("🔄 Wiederholung eingebauter Skills")
    }

    if (blocks.some((b) => b.type === "CHALLENGE")) {
      reasons.push("⭐ Challenge wenn Zeit bleibt")
    }

    return reasons.join(" • ")
  }

  /**
   * Berechnet Review Prioritäten für Skills
   */
  static calculateReviewPriorities(masteryData: SkillMastery[]): ReviewPriority[] {
    return masteryData.map((skill) => {
      const daysSinceReview = Math.floor(
        (new Date().getTime() - new Date(skill.last_practiced).getTime()) / (1000 * 60 * 60 * 24)
      )

      // Confidence: wie sicher sind wir noch bei dieser Skill?
      let confidence = skill.current_level * 20
      if (daysSinceReview > 7) confidence *= 0.8 // Decay nach 1 Woche
      if (daysSinceReview > 14) confidence *= 0.5 // Weiterer Decay nach 2 Wochen

      // Error Rate
      const errorRate = skill.correct_attempts > 0
        ? (skill.attempts - skill.correct_attempts) / skill.attempts
        : 0

      // Priority bestimmen
      let priority: "URGENT" | "HIGH" | "NORMAL" | "LOW" = "NORMAL"
      if (daysSinceReview > 21 || errorRate > 0.5 || skill.current_level < 2) priority = "URGENT"
      else if (daysSinceReview > 14 || errorRate > 0.3) priority = "HIGH"
      else if (daysSinceReview < 3) priority = "LOW"

      return {
        skillId: skill.skill_name,
        skillName: skill.skill_name,
        priority,
        daysSinceReview,
        masteryConfidence: Math.max(0, Math.min(100, confidence)),
        errorRate: Math.round(errorRate * 100) / 100,
        consecutiveFailures: 0, // Wird aus Fehlerhistorie berechnet
        foundationImportance: skill.current_level <= 1 ? "critical" : "high",
      }
    })
  }
}
