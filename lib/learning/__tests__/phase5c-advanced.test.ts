/**
 * Phase 5C - Advanced Features Tests
 */

import { ConfidenceDecayEngine } from "../confidence-decay"
import { ReviewPriorityEngine } from "../review-priority-engine"
import { MissionResumeManager } from "../mission-resume"

describe("Confidence Decay - Phase 5C", () => {
  const engine = new ConfidenceDecayEngine()

  it("berechnet kein Decay für frische Reviews", () => {
    const freshDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 Tag her
    const confidence = engine.calculateConfidence(4, freshDate, 100)
    expect(confidence).toBe(100)
  })

  it("wendet moderates Decay nach 10 Tagen an", () => {
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    const confidence = engine.calculateConfidence(4, oldDate, 100)
    expect(confidence).toBeLessThan(100)
    expect(confidence).toBeGreaterThan(80)
  })

  it("wendet stärkeres Decay nach 30 Tagen an", () => {
    const veryOldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const confidence = engine.calculateConfidence(4, veryOldDate, 100)
    expect(confidence).toBeLessThan(70)
  })

  it("darf nicht unter Mindest-Confidence sinken", () => {
    const veryOldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    const confidence = engine.calculateConfidence(3, veryOldDate, 100)
    expect(confidence).toBeGreaterThanOrEqual(60) // Level 3 = min 60%
  })

  it("gibt richtigen Freshness Status", () => {
    expect(engine.getConfidenceStatus(90)).toBe("confident")
    expect(engine.getConfidenceStatus(70)).toBe("cautious")
    expect(engine.getConfidenceStatus(50)).toBe("uncertain")
    expect(engine.getConfidenceStatus(25)).toBe("very_uncertain")
  })

  it("erkennt wenn Review fällig ist", () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const daysSince = 30
    const isDue = engine.isDueForReview(3, 40, daysSince)
    expect(isDue).toBe(true)
  })

  it("boosted Confidence nach erfolgreichem Review", () => {
    const boosted = engine.boostConfidenceAfterSuccessfulReview(60, 0.9)
    expect(boosted).toBe(100)
  })

  it("reduziert Confidence nach Fehler", () => {
    const reduced = engine.reduceConfidenceAfterFailure(90, 0)
    expect(reduced).toBe(80)
  })
})

describe("Review Priority Engine - Phase 5C", () => {
  const engine = new ReviewPriorityEngine()

  const mockSkill = (
    name: string,
    level: number,
    daysOld: number
  ) => ({
    skill_name: name,
    current_level: level,
    attempts: 10,
    correct_attempts: 7,
    time_spent_minutes: 60,
    last_practiced: new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString(),
    next_review: new Date().toISOString(),
  })

  it("markiert alte unsichere Skills als URGENT", () => {
    const skills = [mockSkill("test", 1, 25)] // Level 1, 25 Tage alt
    const priorities = engine.calculatePriorities(skills)
    expect(priorities[0].priority).toBe("URGENT")
  })

  it("markiert sichere Skills als LOW", () => {
    const skills = [mockSkill("test", 5, 2)] // Level 5, 2 Tage alt
    const priorities = engine.calculatePriorities(skills)
    expect(priorities[0].priority).toBe("LOW")
  })

  it("boosted Current School Topics", () => {
    const skills = [mockSkill("math", 2, 10)]
    const priorities1 = engine.calculatePriorities(skills, [])
    const priorities2 = engine.calculatePriorities(skills, ["math"])

    expect(priorities2[0].score).toBeGreaterThan(priorities1[0].score)
  })

  it("wählt beste Skills für heute", () => {
    const skills = [
      mockSkill("urgent", 1, 30),
      mockSkill("high", 2, 15),
      mockSkill("normal", 3, 5),
      mockSkill("low", 5, 2),
    ]
    const priorities = engine.calculatePriorities(skills)
    const selected = engine.selectForTodaysReview(priorities, 5)

    // Sollte mit URGENT starten
    expect(selected[0].priority).toBe("URGENT")
  })

  it("generiert Review Summary", () => {
    const skills = [
      mockSkill("urgent", 1, 30),
      mockSkill("high", 2, 15),
    ]
    const priorities = engine.calculatePriorities(skills)
    const summary = engine.generateReviewSummary(priorities)

    expect(summary.length).toBeGreaterThan(0)
    expect(summary).toContain("🚨")
  })

  it("berechnet nächsten Review Termin", () => {
    const nextDate = engine.calculateNextReviewDate(3, 85)
    const daysUntil = (nextDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)

    expect(daysUntil).toBeGreaterThan(10)
    expect(daysUntil).toBeLessThan(15)
  })
})

describe("Mission Resume - Phase 5C", () => {
  const manager = new MissionResumeManager()

  beforeEach(() => {
    manager.clearMissionState()
  })

  it("speichert und lädt Mission State", () => {
    const state = {
      missionId: "test_mission",
      userId: "user_test",
      date: "2026-09-23",
      status: "paused" as const,
      currentBlockIndex: 2,
      completedBlocks: 2,
      totalBlocks: 5,
      usedSeconds: 600,
      targetSeconds: 1200,
      xpEarned: 50,
      blocks: [],
      metrics: {},
      adjustments: [],
      lastSavedAt: new Date().toISOString(),
      canResume: true,
    }

    const saved = manager.saveMissionState(state)
    expect(saved).toBe(true)

    const loaded = manager.loadMissionState()
    expect(loaded?.missionId).toBe("test_mission")
    expect(loaded?.xpEarned).toBe(50)
  })

  it("prüft ob Mission noch valid ist", () => {
    const state = {
      missionId: "test",
      userId: "user_test",
      date: "2026-09-23",
      status: "paused" as const,
      currentBlockIndex: 1,
      completedBlocks: 1,
      totalBlocks: 5,
      usedSeconds: 300,
      targetSeconds: 1200,
      xpEarned: 25,
      blocks: [],
      metrics: {},
      adjustments: [],
      lastSavedAt: new Date().toISOString(),
      canResume: true,
    }

    manager.saveMissionState(state)
    const canResume = manager.canResume()
    expect(canResume).toBe(true)
  })

  it("markiert alte Missions als stale", () => {
    const oldDate = new Date(Date.now() - 30 * 60 * 60 * 1000) // 30 Stunden

    const state = {
      missionId: "test",
      userId: "user_test",
      date: "2026-09-23",
      status: "paused" as const,
      currentBlockIndex: 1,
      completedBlocks: 1,
      totalBlocks: 5,
      usedSeconds: 300,
      targetSeconds: 1200,
      xpEarned: 25,
      blocks: [],
      metrics: {},
      adjustments: [],
      lastSavedAt: oldDate.toISOString(),
      canResume: false,
    }

    manager.saveMissionState(state)
    const loaded = manager.loadMissionState()

    // Sollte als nicht mehr resumierbar markiert sein
    expect(loaded?.canResume).toBe(false)
  })

  it("gibt Resume Summary", () => {
    const state = {
      missionId: "test_mission",
      userId: "user_test",
      date: "2026-09-23",
      status: "paused" as const,
      currentBlockIndex: 2,
      completedBlocks: 2,
      totalBlocks: 5,
      usedSeconds: 600,
      targetSeconds: 1200,
      xpEarned: 75,
      blocks: [],
      metrics: {},
      adjustments: [],
      lastSavedAt: new Date().toISOString(),
      canResume: true,
    }

    manager.saveMissionState(state)
    const summary = manager.getResumeSummary()

    expect(summary?.progress).toContain("2 von 5")
    expect(summary?.xpEarned).toBe(75)
  })

  it("löscht Mission State", () => {
    const state = {
      missionId: "test",
      userId: "user_test",
      date: "2026-09-23",
      status: "paused" as const,
      currentBlockIndex: 0,
      completedBlocks: 0,
      totalBlocks: 5,
      usedSeconds: 0,
      targetSeconds: 1200,
      xpEarned: 0,
      blocks: [],
      metrics: {},
      adjustments: [],
      lastSavedAt: new Date().toISOString(),
      canResume: true,
    }

    manager.saveMissionState(state)
    manager.clearMissionState()

    const loaded = manager.loadMissionState()
    expect(loaded).toBeNull()
  })
})
