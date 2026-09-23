/**
 * Mission Executor
 *
 * Führt eine Mission aus und adaptiert sie dynamisch basierend auf:
 * - Performance (Erfolgsrate)
 * - Foundation Gaps (werden während Session erkannt)
 * - Help Level Usage
 * - Frustration Protection
 */

import { DailyMission, MissionBlock, MissionBlockType } from "./mission-planner"

export interface ExecutionMetrics {
  blockId: string
  completedTasks: number
  successfulTasks: number
  failedTasks: number
  successRate: number // 0-1
  averageHelpLevel: number // 0-5
  timeSpentSeconds: number
}

export interface FoundationGapDetection {
  detected: boolean
  skill: string
  confidence: number // 0-1
  severity: "low" | "medium" | "high"
}

export interface MissionAdjustment {
  timestamp: Date
  reason: string
  change: "insert_foundation_repair" | "increase_difficulty" | "decrease_difficulty" | "add_transfer_check" | "skip_block"
  targetBlock: MissionBlock | null
}

export class MissionExecutor {
  private mission: DailyMission
  private metrics: Map<string, ExecutionMetrics> = new Map()
  private adjustments: MissionAdjustment[] = []
  private sessionStartTime: Date = new Date()
  private lastActivityTime: Date = new Date()
  private inactivityThresholdSeconds: number = 60

  constructor(mission: DailyMission) {
    this.mission = mission
  }

  /**
   * Startet einen Block aus und updated Metrics
   */
  recordTaskCompletion(
    blockId: string,
    taskId: string,
    success: boolean,
    helpLevel: number,
    timeSpentSeconds: number
  ): void {
    this.lastActivityTime = new Date()

    if (!this.metrics.has(blockId)) {
      this.metrics.set(blockId, {
        blockId,
        completedTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        successRate: 0,
        averageHelpLevel: 0,
        timeSpentSeconds: 0,
      })
    }

    const metric = this.metrics.get(blockId)!
    metric.completedTasks++
    metric.successfulTasks += success ? 1 : 0
    metric.failedTasks += success ? 0 : 1
    metric.successRate = metric.successfulTasks / metric.completedTasks
    metric.averageHelpLevel = (metric.averageHelpLevel * (metric.completedTasks - 1) + helpLevel) / metric.completedTasks
    metric.timeSpentSeconds += timeSpentSeconds

    // Adaptive Difficulty Check
    this.checkAdaptiveDifficulty(blockId, metric)

    // Foundation Gap Detection
    const gap = this.detectFoundationGap(blockId, metric, success, helpLevel)
    if (gap.detected) {
      this.handleFoundationGapDetection(gap)
    }
  }

  /**
   * Prüft ob Schwierigkeit angepasst werden muss
   */
  private checkAdaptiveDifficulty(blockId: string, metric: ExecutionMetrics): void {
    if (metric.completedTasks < 2) return // Brauche mindestens 2 Tasks zum Bewerten

    const block = this.mission.blocks.find((b) => b.id === blockId)
    if (!block) return

    // Zu leicht: Success Rate > 90% ohne Hilfe
    if (metric.successRate > 0.9 && metric.averageHelpLevel < 1) {
      this.makeAdjustment("increase_difficulty", block, "TOO_EASY")
    }

    // Zu schwer: Success Rate < 30% oder viel Hilfe nötig
    if (metric.successRate < 0.3 || metric.averageHelpLevel > 3) {
      this.makeAdjustment("decrease_difficulty", block, "TOO_HARD")
    }
  }

  /**
   * Erkennt Foundation Gaps während der Session
   *
   * Beispiel:
   * - Zoey arbeitet an Bruchrechnung
   * - Hat Probleme mit "3/5 + 1/4" (ungleiche Nenner)
   * - ELI erkennt: Gemeinsamer Nenner ist unsicher
   */
  private detectFoundationGap(
    blockId: string,
    metric: ExecutionMetrics,
    lastSuccess: boolean,
    lastHelpLevel: number
  ): FoundationGapDetection {
    // Trigger: Mehrfache Fehler mit hohem Help Level
    if (!lastSuccess && lastHelpLevel >= 3 && metric.failedTasks >= 2) {
      const block = this.mission.blocks.find((b) => b.id === blockId)

      return {
        detected: true,
        skill: block?.topicName || "unknown",
        confidence: Math.min(1, (metric.failedTasks / metric.completedTasks) * 1.2),
        severity: metric.averageHelpLevel > 3.5 ? "high" : "medium",
      }
    }

    return { detected: false, skill: "", confidence: 0, severity: "low" }
  }

  /**
   * Behandelt erkannte Foundation Gaps
   */
  private handleFoundationGapDetection(gap: FoundationGapDetection): void {
    // Erstelle Bridge Task für diese Foundation
    const bridgeBlock: MissionBlock = {
      id: `bridge_${gap.skill}_${Date.now()}`,
      type: "FOUNDATION_REPAIR",
      order: this.mission.blocks.length + 10, // Nach aktuellen Blocks
      topicId: gap.skill,
      topicName: `Grundlage: ${gap.skill}`,
      targetTaskCount: gap.severity === "high" ? 3 : 2,
      completedTaskCount: 0,
      estimatedMinutes: gap.severity === "high" ? 4 : 3,
      selectionReason: "FOUNDATION_GAP",
      status: "pending",
    }

    // Nur hinzufügen wenn noch Zeit
    const usedTime = this.getUsedLearningSeconds() / 60
    const remainingTime = this.mission.targetMinutes - usedTime
    if (remainingTime >= 3) {
      this.mission.blocks.push(bridgeBlock)
      this.makeAdjustment("insert_foundation_repair", bridgeBlock, "DETECTED_GAP")
    }
  }

  /**
   * Erstelle Adjustment Record
   */
  private makeAdjustment(
    change: "insert_foundation_repair" | "increase_difficulty" | "decrease_difficulty" | "add_transfer_check" | "skip_block",
    targetBlock: MissionBlock | null,
    reason: string
  ): void {
    this.adjustments.push({
      timestamp: new Date(),
      reason,
      change,
      targetBlock,
    })
  }

  /**
   * Berechne aktive Lernzeit (nicht nur Session-Zeit)
   */
  getUsedLearningSeconds(): number {
    let total = 0
    this.metrics.forEach((m) => {
      total += m.timeSpentSeconds
    })
    return total
  }

  /**
   * Ist die Session noch aktiv? (keine 1+ Min Inaktivität)
   */
  isSessionActive(): boolean {
    const inactiveSeconds = (new Date().getTime() - this.lastActivityTime.getTime()) / 1000
    return inactiveSeconds < this.inactivityThresholdSeconds
  }

  /**
   * Gibt Mission Status zurück
   */
  getMissionStatus() {
    const completedBlocks = this.mission.blocks.filter((b) => b.status === "completed").length
    const totalBlocks = this.mission.blocks.length
    const usedSeconds = this.getUsedLearningSeconds()
    const usedMinutes = Math.round(usedSeconds / 60)

    return {
      completedBlocks,
      totalBlocks,
      progress: Math.round((completedBlocks / totalBlocks) * 100),
      usedMinutes,
      targetMinutes: this.mission.targetMinutes,
      timeRemaining: this.mission.targetMinutes - usedMinutes,
      metrics: Object.fromEntries(this.metrics),
      adjustments: this.adjustments,
      isActive: this.isSessionActive(),
    }
  }

  /**
   * Transferaufgabe nach erfolgreicher Hilfe
   * Gibt an, ob wir eine Transfer-Check einbauen sollen
   */
  shouldAddTransferCheck(blockId: string): boolean {
    const metric = this.metrics.get(blockId)
    if (!metric) return false

    // Trigger: Gerade Hilfe Level 3 bekommen, aber Aufgabe gelöst
    const lastHelpWasHigh = metric.averageHelpLevel >= 3
    const recentSuccessRate = metric.completedTasks >= 3 ? metric.successRate : 0

    // Wenn mit viel Hilfe aber erfolgreich: Transfer Check
    return lastHelpWasHigh && recentSuccessRate > 0.5 && metric.completedTasks >= 2
  }

  /**
   * Session Ende Statistiken
   */
  generateSessionSummary() {
    const usedSeconds = this.getUsedLearningSeconds()
    const totalTasks = Array.from(this.metrics.values()).reduce((sum, m) => sum + m.completedTasks, 0)
    const totalSuccessful = Array.from(this.metrics.values()).reduce((sum, m) => sum + m.successfulTasks, 0)
    const overallSuccessRate = totalTasks > 0 ? totalSuccessful / totalTasks : 0

    return {
      sessionDurationSeconds: usedSeconds,
      taskCount: totalTasks,
      successfulTasks: totalSuccessful,
      successRate: Math.round(overallSuccessRate * 100),
      blocksCompleted: this.mission.blocks.filter((b) => b.status === "completed").length,
      foundationGapsDetected: this.adjustments.filter((a) => a.reason === "DETECTED_GAP").length,
      difficultyAdjustments: this.adjustments.filter((a) => a.change.includes("difficulty")).length,
      recommendedNextTopic: this.getRecommendedNextTopic(),
    }
  }

  /**
   * Empfehlung für nächste Session
   */
  private getRecommendedNextTopic(): string {
    // Finde schwächste Block
    let weakest = { blockId: "", rate: 1 }
    this.metrics.forEach((m, blockId) => {
      if (m.successRate < weakest.rate && m.failedTasks > 0) {
        weakest = { blockId, rate: m.successRate }
      }
    })

    if (weakest.blockId) {
      const block = this.mission.blocks.find((b) => b.id === weakest.blockId)
      if (block) return `"${block.topicName}" nochmal üben`
    }

    return "Schön weitermachen! 🚀"
  }

  /**
   * Mission als Pause speichern (z.B. App geschlossen)
   */
  saveMissionState() {
    return {
      missionId: this.mission.id,
      status: this.mission.status,
      completedBlocks: this.mission.blocks.filter((b) => b.status === "completed").length,
      metrics: Object.fromEntries(this.metrics),
      adjustments: this.adjustments,
      sessionStartTime: this.sessionStartTime,
      usedSeconds: this.getUsedLearningSeconds(),
    }
  }
}
