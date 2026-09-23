/**
 * Mission Planner Tests
 *
 * Testet die regelbasierte Missionserstellung für Phase 5A
 */

import { MissionPlanner } from "../mission-planner"
import { SchoolTopicDetector } from "../school-topic-detector"

describe("Mission Planner - Phase 5A", () => {
  // Test A: Aktueller Schulstoff ist Priorität
  it("Test A: Aktuelle Schulaufgaben bekommen Vorrang", () => {
    const schoolTopics = {
      primary: {
        topicId: "bruchrechnung",
        topicName: "Bruchrechnung",
        firstSeenAt: new Date("2026-09-20"),
        lastSeenAt: new Date("2026-09-22"),
        uploadFrequency: 3,
        recentTaskCount: 5,
        relevanceScore: 75,
        sources: ["upload", "practice"],
        masteryLevel: 2,
      },
      secondary: [],
      detected_at: new Date(),
      confidence: 85,
    }

    const masteryData = [
      {
        skill_name: "Bruchrechnung",
        current_level: 2,
        attempts: 10,
        correct_attempts: 6,
        time_spent_minutes: 60,
        last_practiced: new Date().toISOString(),
        next_review: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    const mission = MissionPlanner.buildDailyMission(
      "user123",
      schoolTopics,
      masteryData as any,
      [],
      [],
      new Map(),
      {}
    )

    const hasSchoolBlock = mission.blocks.some(
      (b) => b.type === "CURRENT_SCHOOL_TOPIC" && b.topicId === "bruchrechnung"
    )
    expect(hasSchoolBlock).toBe(true)
  })

  // Test B: Foundation Gap wird eingebaut
  it("Test B: Foundation Gap wird priorisiert", () => {
    const schoolTopics = {
      primary: {
        topicId: "gleichungen",
        topicName: "Gleichungen",
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        uploadFrequency: 2,
        recentTaskCount: 3,
        relevanceScore: 80,
        sources: ["upload"],
        masteryLevel: 0,
      },
      secondary: [],
      detected_at: new Date(),
      confidence: 90,
    }

    const masteryData = [
      {
        skill_name: "Gleichungen",
        current_level: 0,
        attempts: 0,
        correct_attempts: 0,
        time_spent_minutes: 0,
        last_practiced: new Date().toISOString(),
        next_review: new Date().toISOString(),
      },
      {
        skill_name: "Negative Zahlen",
        current_level: 0,
        attempts: 2,
        correct_attempts: 0,
        time_spent_minutes: 20,
        last_practiced: new Date().toISOString(),
        next_review: new Date().toISOString(),
      },
    ]

    const mission = MissionPlanner.buildDailyMission(
      "user123",
      schoolTopics,
      masteryData as any,
      ["Negative Zahlen"], // Foundation Gap
      [],
      new Map(),
      {}
    )

    const hasFoundationBlock = mission.blocks.some(
      (b) => b.type === "FOUNDATION_REPAIR" && b.topicId === "Negative Zahlen"
    )
    expect(hasFoundationBlock).toBe(true)
  })

  // Test C: Reviews werden eingebaut wenn fällig
  it("Test C: Fällige Reviews werden eingebaut", () => {
    const schoolTopics = {
      primary: null,
      secondary: [],
      detected_at: new Date(),
      confidence: 0,
    }

    const masteryData = [
      {
        skill_name: "Einmaleins",
        current_level: 4,
        attempts: 20,
        correct_attempts: 19,
        time_spent_minutes: 90,
        last_practiced: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        next_review: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    const mission = MissionPlanner.buildDailyMission(
      "user123",
      schoolTopics,
      masteryData as any,
      [],
      ["Einmaleins"], // Review fällig
      new Map(),
      {}
    )

    const hasReviewBlock = mission.blocks.some(
      (b) => b.type === "REVIEW" && b.selectionReason === "REVIEW_DUE"
    )
    expect(hasReviewBlock).toBe(true)
  })

  // Test D: Selection Reasons sind gespeichert
  it("Test D: Selection Reasons werden dokumentiert", () => {
    const schoolTopics = {
      primary: {
        topicId: "test",
        topicName: "Test",
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        uploadFrequency: 1,
        recentTaskCount: 1,
        relevanceScore: 50,
        sources: ["upload"],
        masteryLevel: 1,
      },
      secondary: [],
      detected_at: new Date(),
      confidence: 70,
    }

    const masteryData = [
      {
        skill_name: "Test",
        current_level: 1,
        attempts: 5,
        correct_attempts: 2,
        time_spent_minutes: 30,
        last_practiced: new Date().toISOString(),
        next_review: new Date().toISOString(),
      },
    ]

    const mission = MissionPlanner.buildDailyMission(
      "user123",
      schoolTopics,
      masteryData as any,
      [],
      [],
      new Map(),
      {}
    )

    expect(mission.selectionReasoning).toBeTruthy()
    expect(mission.blocks.every((b) => b.selectionReason)).toBe(true)
  })

  // Test E: Mission passt in ~20 Minuten
  it("Test E: Mission respektiert Zeitbudget", () => {
    const schoolTopics = {
      primary: {
        topicId: "test",
        topicName: "Test",
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        uploadFrequency: 3,
        recentTaskCount: 5,
        relevanceScore: 85,
        sources: ["upload"],
        masteryLevel: 2,
      },
      secondary: [],
      detected_at: new Date(),
      confidence: 90,
    }

    const masteryData = [
      {
        skill_name: "Test",
        current_level: 2,
        attempts: 10,
        correct_attempts: 6,
        time_spent_minutes: 60,
        last_practiced: new Date().toISOString(),
        next_review: new Date().toISOString(),
      },
    ]

    const mission = MissionPlanner.buildDailyMission(
      "user123",
      schoolTopics,
      masteryData as any,
      [],
      [],
      new Map(),
      {}
    )

    const totalMinutes = mission.blocks.reduce((sum, b) => sum + b.estimatedMinutes, 0)
    expect(totalMinutes).toBeLessThanOrEqual(mission.targetMinutes + 5)
    expect(totalMinutes).toBeGreaterThanOrEqual(mission.targetMinutes - 5)
  })

  // Test F: Review Prioritäten korrekt berechnet
  it("Test F: Review Priority Engine funktioniert", () => {
    const masteryData = [
      {
        skill_name: "Skill1",
        current_level: 4,
        attempts: 20,
        correct_attempts: 19,
        time_spent_minutes: 90,
        last_practiced: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 Tage
        next_review: new Date().toISOString(),
      },
      {
        skill_name: "Skill2",
        current_level: 1,
        attempts: 5,
        correct_attempts: 1,
        time_spent_minutes: 30,
        last_practiced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 Tage
        next_review: new Date().toISOString(),
      },
    ]

    const priorities = MissionPlanner.calculateReviewPriorities(masteryData as any)

    expect(priorities[0].skillName).toBe("Skill1") // 25 Tage = URGENT
    expect(priorities[0].priority).toBe("URGENT")
    expect(priorities[1].priority).toBe("LOW")
  })
})

describe("School Topic Detector - Phase 5A", () => {
  it("erkennt primäres und sekundäres Topic richtig", () => {
    const topics = [
      {
        topicId: "bruch",
        topicName: "Bruchrechnung",
        firstSeenAt: new Date("2026-09-20"),
        lastSeenAt: new Date("2026-09-22"),
        uploadFrequency: 5,
        recentTaskCount: 8,
        relevanceScore: 0,
        sources: ["upload", "practice"],
        masteryLevel: 2,
      },
      {
        topicId: "geo",
        topicName: "Geometrie",
        firstSeenAt: new Date("2026-09-10"),
        lastSeenAt: new Date("2026-09-20"),
        uploadFrequency: 1,
        recentTaskCount: 2,
        relevanceScore: 0,
        sources: ["upload"],
        masteryLevel: 1,
      },
    ]

    const result = SchoolTopicDetector.detectCurrentTopics(topics)

    expect(result.primary?.topicId).toBe("bruch")
    expect(result.secondary[0]?.topicId).toBe("geo")
    expect(result.confidence).toBeGreaterThan(70)
  })

  it("erkennt Freshness Status richtig", () => {
    const signal = {
      topicId: "test",
      topicName: "Test",
      firstSeenAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastSeenAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      uploadFrequency: 2,
      recentTaskCount: 3,
      relevanceScore: 50,
      sources: ["upload"],
      masteryLevel: 2,
    }

    const freshness = SchoolTopicDetector.getTopicFreshnessStatus(signal)
    expect(freshness).toBe("recent")
  })
})
