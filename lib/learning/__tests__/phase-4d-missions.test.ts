/**
 * Phase 4D Tests: 20-Minute Missions + XP + Dynamic Difficulty
 */

import { describe, it, expect } from "@jest/globals"
import {
  buildMission,
  calculateMissionRewards,
  updateXPSystem,
  adjustTaskDifficulty,
} from "../mission-system"
import {
  analyzeDifficultyPerformance,
  isInFlowState,
  shouldTriggerConfidenceBoost,
  getDifficultyMessage,
  buildDifficultyTimeline,
} from "../dynamic-difficulty"

describe("Phase 4D: 20-Minute Missions + XP + Dynamic Difficulty", () => {
  // ========== MISSION BUILDING TESTS ==========
  describe("Mission Building", () => {
    it("should create 5-task mission", () => {
      const mockSkills = [
        { skill_id: "1", skill_name: "Addition", current_level: 2, next_review: new Date(Date.now() - 1000000) } as any,
        { skill_id: "2", skill_name: "Subtraction", current_level: 1, next_review: new Date(Date.now() + 1000000) } as any,
        { skill_id: "3", skill_name: "Geometry", current_level: 3, next_review: new Date(Date.now() + 1000000) } as any,
        { skill_id: "4", skill_name: "Fractions", current_level: 1, next_review: new Date(Date.now() + 1000000) } as any,
        { skill_id: "5", skill_name: "Decimals", current_level: 2, next_review: new Date(Date.now() + 1000000) } as any,
      ]

      const mission = buildMission("student1", mockSkills, ["Addition"], 5, 3)

      expect(mission.tasks.length).toBe(5)
      expect(mission.total_time_minutes).toBe(20)
      expect(mission.status).toBe("not_started")
    })

    it("should prioritize overdue skills for spaced repetition", () => {
      const overdueSkill = {
        skill_id: "overdue",
        skill_name: "Addition",
        current_level: 2,
        next_review: new Date(Date.now() - 1000000),
      } as any

      const recentSkill = {
        skill_id: "recent",
        skill_name: "Geometry",
        current_level: 2,
        next_review: new Date(Date.now() + 1000000),
      } as any

      const mission = buildMission("student1", [overdueSkill, recentSkill], [], 5, 0)

      // First task should be the overdue one
      expect(mission.tasks[0]?.skill_id).toBe("overdue")
    })

    it("should include favorite topics", () => {
      const skills = [
        { skill_id: "1", skill_name: "Addition", current_level: 2, next_review: new Date() } as any,
        { skill_id: "2", skill_name: "Geometry", current_level: 2, next_review: new Date() } as any,
      ]

      const mission = buildMission("student1", skills, ["Geometry"], 5, 0)

      // Should have a geometry task
      expect(mission.tasks.some((t) => t.skill_name.includes("Geometry"))).toBe(true)
    })

    it("should apply streak multiplier to XP rewards", () => {
      const mockSkills = [
        { skill_id: "1", skill_name: "Addition", current_level: 2, next_review: new Date(Date.now() - 1000000) } as any,
        { skill_id: "2", skill_name: "Subtraction", current_level: 1, next_review: new Date() } as any,
        { skill_id: "3", skill_name: "Geometry", current_level: 3, next_review: new Date() } as any,
        { skill_id: "4", skill_name: "Fractions", current_level: 1, next_review: new Date() } as any,
        { skill_id: "5", skill_name: "Decimals", current_level: 2, next_review: new Date() } as any,
      ]

      const missionNoStreak = buildMission("student1", mockSkills, [], 5, 0)
      const missionWithStreak = buildMission("student1", mockSkills, [], 5, 10)

      expect(missionWithStreak.streak_bonus_multiplier).toBeGreaterThan(
        missionNoStreak.streak_bonus_multiplier
      )
    })
  })

  // ========== XP REWARD TESTS ==========
  describe("XP Rewards", () => {
    const mockMission = {
      id: "mission1",
      tasks: [
        { difficulty_level: 1 } as any,
        { difficulty_level: 2 } as any,
        { difficulty_level: 3 } as any,
        { difficulty_level: 2 } as any,
        { difficulty_level: 1 } as any,
      ],
      difficulty: "medium" as const,
      total_time_minutes: 20,
      total_time_spent_minutes: 18,
      streak_bonus_multiplier: 1.0,
    } as any

    it("should award completion XP", () => {
      const reward = calculateMissionRewards(mockMission, false, false, 0)
      expect(reward.xp_breakdown.completion).toBeGreaterThan(0)
    })

    it("should award difficulty bonus for harder missions", () => {
      const easyMission = { ...mockMission, difficulty: "easy" as const }
      const hardMission = { ...mockMission, difficulty: "hard" as const }

      const easyReward = calculateMissionRewards(easyMission, false, false, 0)
      const hardReward = calculateMissionRewards(hardMission, false, false, 0)

      expect(hardReward.xp_total).toBeGreaterThan(easyReward.xp_total)
    })

    it("should award perfect score bonus", () => {
      const reward = calculateMissionRewards(mockMission, true, false, 0)
      expect(reward.xp_breakdown.perfect).toBe(100)
    })

    it("should award speed bonus for finishing on time", () => {
      const missionFast = { ...mockMission, total_time_spent_minutes: 16 }
      const missionSlow = { ...mockMission, total_time_spent_minutes: 22 }

      const fastReward = calculateMissionRewards(missionFast, false, true, 0)
      const slowReward = calculateMissionRewards(missionSlow, false, false, 0)

      expect(fastReward.xp_breakdown.speed).toBeGreaterThan(0)
    })

    it("should apply streak multiplier to total XP", () => {
      const missionNoStreak = { ...mockMission, streak_bonus_multiplier: 1.0 }
      const missionStreak = { ...mockMission, streak_bonus_multiplier: 1.3 }

      const noStreakReward = calculateMissionRewards(missionNoStreak, false, false, 0)
      const streakReward = calculateMissionRewards(missionStreak, false, false, 0)

      expect(streakReward.xp_total).toBeGreaterThan(noStreakReward.xp_total)
    })
  })

  // ========== XP SYSTEM LEVEL UP TESTS ==========
  describe("XP System & Level Progression", () => {
    it("should track cumulative XP", () => {
      const initialXP = {
        total_xp: 1000,
        current_level: 3,
        xp_to_next_level: 500,
        level_progress: 0,
        lifetime_missions: 5,
        completed_missions: 5,
        current_streak_missions: 3,
        best_streak_missions: 5,
        badges: [],
        rank_tier: "Apprentice" as const,
      }

      const reward = {
        mission_id: "m1",
        xp_total: 250,
        xp_breakdown: { completion: 100, difficulty: 50, streak: 50, speed: 50, perfect: 0 },
        badges_earned: [],
        next_level_progress: 50,
        total_xp_ever: 250,
        current_level: 1,
      }

      const updated = updateXPSystem(initialXP, reward, true)

      expect(updated.total_xp).toBe(1250)
      expect(updated.level_progress).toBeGreaterThan(0)
    })

    it("should level up at 500 XP intervals", () => {
      const xpSystem = {
        total_xp: 450,
        current_level: 1,
        xp_to_next_level: 50,
        level_progress: 90,
        lifetime_missions: 10,
        completed_missions: 10,
        current_streak_missions: 2,
        best_streak_missions: 5,
        badges: [],
        rank_tier: "Apprentice" as const,
      }

      const reward = {
        mission_id: "m1",
        xp_total: 100,
        xp_breakdown: { completion: 100, difficulty: 0, streak: 0, speed: 0, perfect: 0 },
        badges_earned: [],
        next_level_progress: 10,
        total_xp_ever: 100,
        current_level: 1,
      }

      const updated = updateXPSystem(xpSystem, reward, true)

      expect(updated.current_level).toBe(2) // Should level up!
    })

    it("should progress through rank tiers", () => {
      const lowLevel = updateXPSystem(
        {
          total_xp: 0,
          current_level: 5,
          xp_to_next_level: 0,
          level_progress: 0,
          lifetime_missions: 0,
          completed_missions: 0,
          current_streak_missions: 0,
          best_streak_missions: 0,
          badges: [],
          rank_tier: "Novice" as const,
        },
        { mission_id: "m", xp_total: 0, xp_breakdown: {} as any, badges_earned: [], next_level_progress: 0, total_xp_ever: 0, current_level: 0 },
        true
      )
      expect(lowLevel.rank_tier).toBe("Novice")

      const midLevel = updateXPSystem(
        {
          total_xp: 10000,
          current_level: 25,
          xp_to_next_level: 0,
          level_progress: 0,
          lifetime_missions: 0,
          completed_missions: 0,
          current_streak_missions: 0,
          best_streak_missions: 0,
          badges: [],
          rank_tier: "Scholar" as const,
        },
        { mission_id: "m", xp_total: 0, xp_breakdown: {} as any, badges_earned: [], next_level_progress: 0, total_xp_ever: 0, current_level: 0 },
        true
      )
      expect(midLevel.rank_tier).toBe("Scholar")
    })

    it("should reset mission streak on abandon", () => {
      const xpSystem = {
        total_xp: 1000,
        current_level: 3,
        xp_to_next_level: 0,
        level_progress: 0,
        lifetime_missions: 10,
        completed_missions: 9,
        current_streak_missions: 5,
        best_streak_missions: 7,
        badges: [],
        rank_tier: "Apprentice" as const,
      }

      const reward = {
        mission_id: "m1",
        xp_total: 0,
        xp_breakdown: {} as any,
        badges_earned: [],
        next_level_progress: 0,
        total_xp_ever: 0,
        current_level: 0,
      }

      const updated = updateXPSystem(xpSystem, reward, false) // Abandoned

      expect(updated.current_streak_missions).toBe(0)
      expect(updated.best_streak_missions).toBe(7) // Record preserved
    })
  })

  // ========== DYNAMIC DIFFICULTY TESTS ==========
  describe("Dynamic Difficulty Adjustment", () => {
    it("should detect crushing_it performance", () => {
      const state = analyzeDifficultyPerformance({
        classifications: ["A", "A", "A", "A"],
        helpLevels: [0, 0, 0, 0],
        timePerProblem: [60, 50, 55, 45],
        attemptCounts: [1, 1, 1, 1],
      })

      expect(state.performance_trend).toBe("crushing_it")
      expect(state.recommended_difficulty).toBeGreaterThan(state.current_difficulty)
    })

    it("should detect struggling performance", () => {
      const state = analyzeDifficultyPerformance({
        classifications: ["C", "D", "C", "E"],
        helpLevels: [4, 4, 4, 5],
        timePerProblem: [300, 400, 350, 400],
        attemptCounts: [4, 5, 4, 5],
      })

      expect(state.performance_trend).toBe("struggling")
      expect(state.recommended_difficulty).toBeLessThan(state.current_difficulty)
    })

    it("should detect overwhelmed performance", () => {
      const state = analyzeDifficultyPerformance({
        classifications: ["D", "E", "D", "E", "D"],
        helpLevels: [5, 5, 5, 5, 5],
        timePerProblem: [500, 600, 550, 600, 550],
        attemptCounts: [6, 7, 6, 7, 6],
      })

      expect(state.performance_trend).toBe("overwhelmed")
      expect(state.recommended_difficulty).toBe(1)
    })

    it("should maintain flow state", () => {
      const state = analyzeDifficultyPerformance({
        classifications: ["A", "B", "A", "B"],
        helpLevels: [0, 1, 0, 1],
        timePerProblem: [120, 150, 130, 140],
        attemptCounts: [1, 2, 1, 2],
      })

      expect(isInFlowState(state)).toBe(true)
    })
  })

  // ========== CONFIDENCE BOOST TESTS ==========
  describe("Confidence Boost Mechanism", () => {
    it("should trigger after frustration signals", () => {
      const state = analyzeDifficultyPerformance({
        classifications: ["D", "C", "D"],
        helpLevels: [4, 4, 4],
        timePerProblem: [300, 300, 300],
        attemptCounts: [4, 4, 4],
      })

      expect(shouldTriggerConfidenceBoost(state)).toBe(true)
    })

    it("should trigger on error streak", () => {
      const state = analyzeDifficultyPerformance({
        classifications: ["C", "D", "E", "C"],
        helpLevels: [3, 4, 4, 3],
        timePerProblem: [200, 200, 200, 200],
        attemptCounts: [3, 3, 3, 3],
      })

      expect(shouldTriggerConfidenceBoost(state)).toBe(true)
    })

    it("should not trigger on confident performance", () => {
      const state = analyzeDifficultyPerformance({
        classifications: ["A", "A", "A"],
        helpLevels: [0, 0, 0],
        timePerProblem: [90, 100, 95],
        attemptCounts: [1, 1, 1],
      })

      expect(shouldTriggerConfidenceBoost(state)).toBe(false)
    })
  })

  // ========== DIFFICULTY MESSAGING TESTS ==========
  describe("Difficulty Messaging", () => {
    it("should message crushing_it appropriately", () => {
      const state = {
        performance_trend: "crushing_it" as const,
      } as any

      const msg = getDifficultyMessage(state)
      expect(msg).toContain("🔥")
      expect(msg).toContain("schwerer")
    })

    it("should message overwhelmed appropriately", () => {
      const state = {
        performance_trend: "overwhelmed" as const,
      } as any

      const msg = getDifficultyMessage(state)
      expect(msg).toContain("🌱")
      expect(msg).toContain("Schwierigkeit")
    })
  })

  // ========== DIFFICULTY TIMELINE TESTS ==========
  describe("Difficulty Timeline", () => {
    it("should calculate flow state percentage", () => {
      const history = [
        { performance_trend: "challenged" } as any,
        { performance_trend: "challenged" } as any,
        { performance_trend: "crushing_it" } as any,
        { performance_trend: "challenged" } as any,
      ]

      const timeline = buildDifficultyTimeline(history)

      expect(timeline.in_flow_state_percentage).toBeGreaterThan(0)
      expect(timeline.in_flow_state_percentage).toBeLessThanOrEqual(100)
    })
  })
})
