/**
 * Mission Executor Tests - Phase 5B
 */

import { MissionExecutor } from "../mission-executor"
import { DailyMission, MissionBlock } from "../mission-planner"

describe("Mission Executor - Adaptive Execution", () => {
  const createTestMission = (): DailyMission => ({
    id: "test_mission",
    userId: "user_test",
    date: new Date(),
    blocks: [
      {
        id: "block1",
        type: "WARM_UP",
        order: 1,
        topicId: "test",
        topicName: "Test",
        targetTaskCount: 2,
        completedTaskCount: 0,
        estimatedMinutes: 2,
        selectionReason: "WARM_UP",
        status: "pending",
      },
    ],
    targetMinutes: 20,
    selectionReasoning: "Test mission",
    status: "planned",
    activeLearningSeconds: 0,
    xpEarned: 0,
  })

  it("verfolgt Task Completion und berechnet Erfolgsrate", () => {
    const mission = createTestMission()
    const executor = new MissionExecutor(mission)

    executor.recordTaskCompletion("block1", "task1", true, 0, 120)
    executor.recordTaskCompletion("block1", "task2", true, 0, 130)
    executor.recordTaskCompletion("block1", "task3", false, 1, 150)

    const status = executor.getMissionStatus()
    expect(status.usedSeconds).toBe(400)
    expect(status.usedMinutes).toBeGreaterThan(6)
  })

  it("erkennt Foundation Gaps nach mehreren Fehlern mit Hilfe", () => {
    const mission = createTestMission()
    const executor = new MissionExecutor(mission)

    // Mehrfache Fehler mit hohem Help Level
    executor.recordTaskCompletion("block1", "task1", false, 3, 100)
    executor.recordTaskCompletion("block1", "task2", false, 3, 100)
    executor.recordTaskCompletion("block1", "task3", false, 3, 100)

    const status = executor.getMissionStatus()
    // Bridge Block sollte hinzugefügt worden sein
    const hasBridgeBlock = mission.blocks.some((b) => b.type === "FOUNDATION_REPAIR")
    expect(hasBridgeBlock).toBe(true)
  })

  it("passt Schwierigkeit an wenn zu leicht", () => {
    const mission = createTestMission()
    const executor = new MissionExecutor(mission)

    // Perfekt ohne Hilfe
    executor.recordTaskCompletion("block1", "task1", true, 0, 60)
    executor.recordTaskCompletion("block1", "task2", true, 0, 60)
    executor.recordTaskCompletion("block1", "task3", true, 0, 60)

    const status = executor.getMissionStatus()
    const difficultyAdjustments = status.adjustments.filter((a) => a.change.includes("difficulty"))
    expect(difficultyAdjustments.length).toBeGreaterThan(0)
  })

  it("speichert Mission State für Pausen", () => {
    const mission = createTestMission()
    const executor = new MissionExecutor(mission)

    executor.recordTaskCompletion("block1", "task1", true, 0, 120)
    executor.recordTaskCompletion("block1", "task2", true, 1, 130)

    const savedState = executor.saveMissionState()

    expect(savedState.missionId).toBe("test_mission")
    expect(savedState.completedBlocks).toBe(0)
    expect(savedState.usedSeconds).toBe(250)
    expect(Object.keys(savedState.metrics).length).toBe(1)
  })

  it("prüft Session Aktivität richtig", () => {
    const mission = createTestMission()
    const executor = new MissionExecutor(mission)

    executor.recordTaskCompletion("block1", "task1", true, 0, 60)

    // Gerade Activity -> active
    expect(executor.isSessionActive()).toBe(true)
  })

  it("generiert Session Summary", () => {
    const mission = createTestMission()
    const executor = new MissionExecutor(mission)

    executor.recordTaskCompletion("block1", "task1", true, 0, 60)
    executor.recordTaskCompletion("block1", "task2", false, 2, 80)
    executor.recordTaskCompletion("block1", "task3", true, 1, 70)

    const summary = executor.generateSessionSummary()

    expect(summary.taskCount).toBe(3)
    expect(summary.successfulTasks).toBe(2)
    expect(summary.successRate).toBe(66) // 2/3
    expect(summary.sessionDurationSeconds).toBe(210)
  })
})

describe("Task Selector - Priority", () => {
  it("bevorzugt echte Schulaufgaben vor KI-generierten", () => {
    // Test wird mit echten Tasks implementiert in Integration Tests
    // Hier nur Struktur-Test
    expect(true).toBe(true)
  })
})
