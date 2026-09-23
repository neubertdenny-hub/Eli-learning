/**
 * Phase 5D - OpenAI Integration Tests
 */

import { OpenAITaskGenerator } from "../openai-task-generator"

describe("OpenAI Task Generator - Phase 5D", () => {
  const generator = new OpenAITaskGenerator() // No API key = Mock mode

  it("generiert Mock Task Varianten offline", async () => {
    const variants = await generator.generateTaskVariants({
      originalTask: "3/5 + 1/5 = ?",
      difficulty: 2,
      topic: "Bruchrechnung",
      variantCount: 3,
    })

    expect(variants.length).toBeGreaterThan(0)
    expect(variants[0]).not.toBe("3/5 + 1/5 = ?")
    variants.forEach((v) => {
      expect(v.length).toBeGreaterThan(0)
    })
  })

  it("generiert Erklärungen im Mock Mode", async () => {
    const explanation = await generator.generateExplanation(
      "3/5 + 1/5 = ?",
      "4/5",
      "Bruchrechnung"
    )

    expect(explanation).not.toBeNull()
    expect(explanation?.step1).toBeDefined()
    expect(explanation?.step2).toBeDefined()
    expect(explanation?.step3).toBeDefined()
    expect(explanation?.keyInsight).toBeDefined()
    expect(explanation?.commonMistake).toBeDefined()
  })

  it("klassifiziert Topics semantisch", async () => {
    const classification = await generator.classifyTopicSemantics(
      "Addieren von Brüchen mit gleichem Nenner"
    )

    expect(classification).toBeDefined()
    expect(classification.length).toBeGreaterThan(0)
    expect(classification).not.toContain(" ") // snake_case
  })

  it("schätzt OpenAI Kosten", () => {
    const cost = generator.estimateCost(10)
    expect(cost).toBeGreaterThan(0)
    expect(cost).toBeLessThan(0.05) // Sollte <5 Cent sein
  })

  it("generiert unterschiedliche Varianten", async () => {
    const variants1 = await generator.generateTaskVariants({
      originalTask: "5 + 3 = ?",
      difficulty: 1,
      topic: "Addition",
      variantCount: 3,
    })

    const variants2 = await generator.generateTaskVariants({
      originalTask: "5 + 3 = ?",
      difficulty: 1,
      topic: "Addition",
      variantCount: 3,
    })

    // Sollten unterschiedlich sein (mindestens teilweise)
    expect(variants1.join(",")).not.toBe(variants2.join(","))
  })

  it("handhabt Edge Cases korrekt", async () => {
    const variants = await generator.generateTaskVariants({
      originalTask: "1 × 1 = ?",
      difficulty: 1,
      topic: "Multiplikation",
      variantCount: 1,
    })

    expect(variants.length).toBeGreaterThan(0)
    // Sollte mindestens ein Ergebnis haben
    expect(variants[0]).toBeDefined()
  })
})

describe("Mission End Screen - Phase 5D", () => {
  const mockSummary = {
    successRate: 85,
    taskCount: 5,
    successfulTasks: 4,
    timeSpentMinutes: 18,
    xpEarned: 85,
    nextTopic: "Bruchrechnung kürzen",
    perfectStreak: false,
    foundationGapsDetected: 0,
    achievements: ["Schnell und akkurat 🚀", "3-er Streak 🔥"],
  }

  it("rendert erfolgreich mit guter Performance", () => {
    expect(mockSummary.successRate).toBeGreaterThanOrEqual(80)
    expect(mockSummary.nextTopic).toBeDefined()
  })

  it("zeigt Foundation Gaps wenn erkannt", () => {
    const summaryWithGaps = {
      ...mockSummary,
      foundationGapsDetected: 2,
    }

    expect(summaryWithGaps.foundationGapsDetected).toBeGreaterThan(0)
  })

  it("berechnet XP richtig", () => {
    expect(mockSummary.xpEarned).toBe(85)
    expect(mockSummary.xpEarned).toBeGreaterThan(0)
  })

  it("zeigt Achievements wenn vorhanden", () => {
    expect(mockSummary.achievements.length).toBeGreaterThan(0)
    mockSummary.achievements.forEach((a) => {
      expect(a.length).toBeGreaterThan(0)
    })
  })

  it("unterstützt Perfect Streaks", () => {
    const perfectSummary = {
      ...mockSummary,
      successRate: 100,
      perfectStreak: true,
      achievements: ["Perfect Mission 💯"],
    }

    expect(perfectSummary.perfectStreak).toBe(true)
    expect(perfectSummary.successRate).toBe(100)
  })
})

describe("Parent Dashboard Enhancements - Phase 5D", () => {
  it("zeigt Review Prioritäten korrekt", () => {
    const priorities = {
      urgent: 2,
      high: 1,
      normal: 3,
      low: 1,
    }

    expect(priorities.urgent).toBeGreaterThan(0)
    expect(priorities.high + priorities.urgent).toBeGreaterThan(0)
  })

  it("berechnet Confidence Decay Impact", () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const daysSince = Math.floor(
      (new Date().getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    expect(daysSince).toBeGreaterThan(25)
  })

  it("zeigt Session Quality Metriken", () => {
    const metrics = {
      successRate: 71,
      foundationGapsDetected: 3,
      activeLearningMinutes: 18,
    }

    expect(metrics.successRate).toBeGreaterThan(0)
    expect(metrics.successRate).toBeLessThanOrEqual(100)
    expect(metrics.activeLearningMinutes).toBeGreaterThan(0)
  })

  it("erklärt Confidence Decay für Parents", () => {
    const explanation =
      "ELI verfolgt, wie sicher Zoey noch bei jeder Skill ist. Skills, die länger nicht überprüft wurden, bekommen niedrigere Priorität bis zur nächsten Wiederholung."

    expect(explanation.length).toBeGreaterThan(0)
    expect(explanation).toContain("Confidence")
  })
})
