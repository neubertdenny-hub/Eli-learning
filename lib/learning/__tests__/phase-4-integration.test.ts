/**
 * Phase 4A + 4B Integration Tests
 * Tests the complete learning flow: Classification → Routing → Bridge Tasks
 */

import { describe, it, expect, beforeEach } from "@jest/globals"
import { determineHelpLevel, HelpContext } from "../help-engine"
import { detectFoundationGaps, FoundationGap } from "../foundation-gap-detector"
import { routeToWorkflow } from "../workflow-router"
import { shouldCreateBridgeTasks, generateBridgeTasks } from "../bridge-task-generator"

describe("Phase 4A + 4B: Learning Engine Integration", () => {
  // ========== SCENARIO 1: Correct Answer ==========
  describe("Scenario 1: Correct Answer (Classification A)", () => {
    it("should celebrate and advance to next task", () => {
      const decision = routeToWorkflow("A", true, undefined, undefined, 1)

      expect(decision.workflow).toBe("normal")
      expect(decision.action).toBe("celebrate_and_advance")
      expect(decision.next_step).toBe("next_task")
      expect(decision.should_reprompt).toBe(false)
      expect(decision.eli_message).toContain("✅")
    })

    it("should give 0 help level for independent correct", () => {
      const context: HelpContext = {
        classification: "A",
        attemptCount: 1,
        previousHelpLevels: [],
        confidence: 0.95,
      }

      const help = determineHelpLevel(context)
      expect(help.recommendedLevel).toBe(0)
      expect(help.shouldReprompt).toBe(false)
    })
  })

  // ========== SCENARIO 2: Small Error ==========
  describe("Scenario 2: Small Error (Classification B)", () => {
    it("should hint on first attempt", () => {
      const decision = routeToWorkflow("B", false, undefined, undefined, 1)

      expect(decision.workflow).toBe("normal")
      expect(decision.action).toBe("reprompt_with_hint")
      expect(decision.should_reprompt).toBe(true)
      expect(decision.eli_message).toContain("Fast")
    })

    it("should escalate to Level 3 on third attempt", () => {
      const context: HelpContext = {
        classification: "B",
        attemptCount: 3,
        previousHelpLevels: [1, 2],
        confidence: 0.85,
      }

      const help = determineHelpLevel(context)
      expect(help.recommendedLevel).toBe(3)
      expect(help.mood).toBe("explaining")
    })
  })

  // ========== SCENARIO 3: Middle Error ==========
  describe("Scenario 3: Middle Error (Classification C)", () => {
    it("should ask which step on first attempt", () => {
      const decision = routeToWorkflow("C", false, undefined, undefined, 1)

      expect(decision.workflow).toBe("normal")
      expect(decision.action).toBe("give_direction")
      expect(decision.mood).toBe("thinking")
    })

    it("should go step-by-step on second attempt", () => {
      const decision = routeToWorkflow("C", false, undefined, undefined, 2)

      expect(decision.workflow).toBe("normal")
      expect(decision.action).toBe("explain_step")
      expect(decision.next_step).toBe("step_by_step")
    })
  })

  // ========== SCENARIO 4: Foundation Gap ==========
  describe("Scenario 4: Foundation Gap (Classification D)", () => {
    it("should detect negative number gap", async () => {
      const problem = "-3 + 5 = ?"
      const userAnswer = "-8"
      const correctSolution = "2"

      const result = await detectFoundationGaps(
        problem,
        userAnswer,
        correctSolution,
        "D"
      )

      expect(result.has_gap).toBe(true)
      expect(result.gaps.length).toBeGreaterThan(0)
      expect(result.gaps[0]?.foundation_key).toBe("negative_numbers")
      expect(result.severity).toBe("high")
    })

    it("should route to foundation gap workflow", () => {
      const decision = routeToWorkflow("D", false, undefined, ["negative_numbers"], 1)

      expect(decision.workflow).toBe("foundation_gap")
      expect(decision.action).toBe("create_bridge_tasks")
      expect(decision.next_step).toBe("bridge_tasks")
      expect(decision.should_reprompt).toBe(false)
    })

    it("should create bridge task set", async () => {
      const bridgeTasks = await generateBridgeTasks(
        "negative_numbers",
        3, // original difficulty
        "original_task_123"
      )

      expect(bridgeTasks.foundation).toBe("negative_numbers")
      expect(bridgeTasks.tasks.length).toBe(3)
      expect(bridgeTasks.tasks[0]?.difficulty).toBeLessThan(3)
      expect(bridgeTasks.tasks[2]?.difficulty).toBe(3)
      expect(bridgeTasks.tasks[0]?.is_bridge).toBe(true)
    })

    it("should not create bridge tasks for low severity", () => {
      const should = shouldCreateBridgeTasks("D", "low")
      expect(should).toBe(false)

      const shouldMedium = shouldCreateBridgeTasks("D", "medium")
      expect(shouldMedium).toBe(true)

      const shouldHigh = shouldCreateBridgeTasks("D", "high")
      expect(shouldHigh).toBe(true)
    })
  })

  // ========== SCENARIO 5: Problem Not Understood ==========
  describe("Scenario 5: Problem Not Understood (Classification E)", () => {
    it("should clarify problem", () => {
      const decision = routeToWorkflow("E", false, undefined, undefined, 1)

      expect(decision.workflow).toBe("clarify_problem")
      expect(decision.action).toBe("simplify_and_clarify")
      expect(decision.mood).toBe("explaining")
      expect(decision.should_reprompt).toBe(true)
    })
  })

  // ========== SCENARIO 6: Uncertain Recognition ==========
  describe("Scenario 6: Uncertain Input (Classification F)", () => {
    it("should ask for confirmation", () => {
      const decision = routeToWorkflow("F", false, undefined, undefined, 1)

      expect(decision.workflow).toBe("confirm_input")
      expect(decision.action).toBe("ask_for_clarification")
      expect(decision.mood).toBe("thinking")
    })
  })

  // ========== COMPLETE FLOW TESTS ==========
  describe("Complete Learning Flow", () => {
    it("should handle: Try → Small Error → Hint → Correct → Advance", async () => {
      // First attempt: small error
      const flow1 = routeToWorkflow("B", false, undefined, undefined, 1)
      expect(flow1.should_reprompt).toBe(true)

      // Second attempt: correct
      const flow2 = routeToWorkflow("A", true, undefined, undefined, 2)
      expect(flow2.next_step).toBe("next_task")
    })

    it("should handle: Foundation Gap → Bridge Tasks → Return → Success", async () => {
      // Initial attempt: foundation gap
      const flow1 = routeToWorkflow("D", false, undefined, ["negative_numbers"], 1)
      expect(flow1.workflow).toBe("foundation_gap")

      // Create bridge tasks
      const bridgeTasks = await generateBridgeTasks(
        "negative_numbers",
        3,
        "task_xyz"
      )
      expect(bridgeTasks.tasks.length).toBe(3)

      // After bridge tasks: return and retry
      const flow2 = routeToWorkflow("A", true, undefined, undefined, 1)
      expect(flow2.next_step).toBe("next_task")
    })

    it("should handle: Multiple attempts → Escalate help → Show solution", async () => {
      // Attempt 1: small error, level 1
      const help1 = determineHelpLevel({
        classification: "B",
        attemptCount: 1,
        previousHelpLevels: [],
        confidence: 0.85,
      })
      expect(help1.recommendedLevel).toBe(1)

      // Attempt 2: still wrong, level 2
      const help2 = determineHelpLevel({
        classification: "B",
        attemptCount: 2,
        previousHelpLevels: [1],
        confidence: 0.85,
      })
      expect(help2.recommendedLevel).toBe(2)

      // Attempt 3: escalate to level 3
      const help3 = determineHelpLevel({
        classification: "B",
        attemptCount: 3,
        previousHelpLevels: [1, 2],
        confidence: 0.85,
      })
      expect(help3.recommendedLevel).toBe(3)
    })
  })

  // ========== ERROR DETECTION TESTS ==========
  describe("Foundation Gap Error Detection", () => {
    it("should detect negative number sign errors", async () => {
      const result = await detectFoundationGaps(
        "-5 + 3",
        "-8", // wrong sign
        "-2",
        "D"
      )

      expect(result.has_gap).toBe(true)
      expect(result.gaps.some((g) => g.foundation_key === "negative_numbers")).toBe(true)
    })

    it("should detect decimal point errors", async () => {
      const result = await detectFoundationGaps(
        "2.5 × 4",
        "10", // wrong decimal placement
        "10.0",
        "D"
      )

      expect(result.has_gap).toBe(true)
      expect(result.gaps.some((g) => g.foundation_key === "decimal_numbers")).toBe(true)
    })

    it("should not flag correct answers as gaps", async () => {
      const result = await detectFoundationGaps(
        "3 + 4",
        "7",
        "7",
        "A"
      )

      expect(result.has_gap).toBe(false)
    })
  })
})
