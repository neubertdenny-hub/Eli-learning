/**
 * Phase 4C Tests: Mastery Engine + Eli Memory + Spaced Repetition
 */

import { describe, it, expect } from "@jest/globals"
import {
  calculateMasteryLevel,
  shouldUpdateMastery,
  calculateNextReview,
  calculateConfidence,
  calculateMasteryProgress,
  getMasteryDescription,
} from "../mastery-engine"
import {
  createPersonalizedMessage,
  detectLearningPersonality,
  generateEliContext,
  shouldCelebrate,
} from "../eli-memory"
import {
  processLearningSession,
  getSkillsDueForReview,
  recommendNextSkill,
  updateStreak,
} from "../learning-session"

describe("Phase 4C: Mastery Engine + Eli Memory + Spaced Repetition", () => {
  // ========== MASTERY LEVEL TESTS ==========
  describe("Mastery Level Calculation", () => {
    it("should progress from Level 0 → 1 with first attempt correct", () => {
      const newLevel = calculateMasteryLevel(0, true, 0, 1)
      expect(newLevel).toBe(1)
    })

    it("should progress from Level 1 → 2 on second attempt correct", () => {
      const newLevel = calculateMasteryLevel(1, true, 0, 2)
      expect(newLevel).toBe(2)
    })

    it("should progress Level 2 → 3 (Fluent) with first-try correct", () => {
      const newLevel = calculateMasteryLevel(2, true, 0, 1)
      expect(newLevel).toBe(3)
    })

    it("should progress to Level 5 (Mastery) maximum", () => {
      const newLevel = calculateMasteryLevel(4, true, 0, 1)
      expect(newLevel).toBe(5)
    })

    it("should cap at Level 5 (can't go higher)", () => {
      const newLevel = calculateMasteryLevel(5, true, 0, 1)
      expect(newLevel).toBe(5)
    })

    it("should regress 1 level on incorrect answer", () => {
      const newLevel = calculateMasteryLevel(3, false, 0, 1)
      expect(newLevel).toBe(2)
    })

    it("should not go below Level 0", () => {
      const newLevel = calculateMasteryLevel(0, false, 0, 1)
      expect(newLevel).toBe(0)
    })

    it("should not progress with high help level", () => {
      const newLevel = calculateMasteryLevel(2, true, 4, 1)
      expect(newLevel).toBe(2) // Stays same, doesn't progress
    })
  })

  // ========== SPACED REPETITION TESTS ==========
  describe("Spaced Repetition Scheduling", () => {
    const now = new Date()

    it("Level 0-1: Review daily on failure", () => {
      const next = calculateNextReview(0, now, false)
      const daysDiff = Math.floor(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(1)
    })

    it("Level 1: Review daily on success", () => {
      const next = calculateNextReview(1, now, true)
      const daysDiff = Math.floor(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(1)
    })

    it("Level 2: Review every 2 days", () => {
      const next = calculateNextReview(2, now, true)
      const daysDiff = Math.floor(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(2)
    })

    it("Level 3: Review every 3 days (weekly series)", () => {
      const next = calculateNextReview(3, now, true)
      const daysDiff = Math.floor(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(3)
    })

    it("Level 4: Review weekly", () => {
      const next = calculateNextReview(4, now, true)
      const daysDiff = Math.floor(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(7)
    })

    it("Level 5 (Mastery): Review biweekly (maintenance only)", () => {
      const next = calculateNextReview(5, now, true)
      const daysDiff = Math.floor(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      expect(daysDiff).toBe(14)
    })
  })

  // ========== CONFIDENCE SCORING ==========
  describe("Confidence Calculation", () => {
    it("should have 0 confidence with no attempts", () => {
      const conf = calculateConfidence(0, 0, 0)
      expect(conf).toBe(0)
    })

    it("should grow with correct attempts", () => {
      const conf1 = calculateConfidence(3, 2, 0.66) // 66% success
      const conf2 = calculateConfidence(10, 8, 0.8) // 80% success
      expect(conf2).toBeGreaterThan(conf1)
    })

    it("should boost confidence on perfect recent streak", () => {
      const conf1 = calculateConfidence(5, 4, 0.8) // 80% recent
      const conf2 = calculateConfidence(5, 4, 1.0) // 100% recent (perfect streak)
      expect(conf2).toBeGreaterThan(conf1)
    })

    it("should max at 1.0", () => {
      const conf = calculateConfidence(100, 95, 1.0)
      expect(conf).toBeLessThanOrEqual(1.0)
    })
  })

  // ========== MASTERY PROGRESS SUMMARY ==========
  describe("Mastery Progress Dashboard", () => {
    it("should calculate skills mastered (level 5)", () => {
      const skills = [
        { current_level: 5 } as any,
        { current_level: 5 } as any,
        { current_level: 3 } as any,
      ]
      const progress = calculateMasteryProgress(skills)
      expect(progress.mastered_count).toBe(2)
    })

    it("should calculate expert count (level 4+)", () => {
      const skills = [
        { current_level: 5 } as any,
        { current_level: 4 } as any,
        { current_level: 3 } as any,
      ]
      const progress = calculateMasteryProgress(skills)
      expect(progress.expert_count).toBe(2)
    })

    it("should calculate average mastery level", () => {
      const skills = [
        { current_level: 5 } as any,
        { current_level: 4 } as any,
        { current_level: 2 } as any,
      ]
      const progress = calculateMasteryProgress(skills)
      expect(progress.average_mastery).toBe((5 + 4 + 2) / 3)
    })

    it("should identify focus skills (overdue reviews)", () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)

      const skills = [
        {
          current_level: 2,
          skill_name: "Addition",
          next_review: pastDate,
        } as any,
      ]
      const progress = calculateMasteryProgress(skills)
      expect(progress.next_focus.length).toBeGreaterThan(0)
    })
  })

  // ========== ELI MEMORY TESTS ==========
  describe("Eli Memory & Personalization", () => {
    it("should create personalized greeting", () => {
      const memory = {
        student_name: "Zoey",
        learning_personality: "schnell und motiviert",
        recent_achievements: ["Addition", "Subtraktion"],
        recent_struggles: [],
        jokes_or_interests: [],
        mentor_tips: [],
      }
      const msg = createPersonalizedMessage(memory, "greeting")
      expect(msg).toContain("Zoey")
      expect(msg).toContain("👋")
    })

    it("should create encouraging message", () => {
      const memory = {
        student_name: "Zoey",
        learning_personality: "arbeitet hart",
        recent_achievements: [],
        recent_struggles: ["Multiplikation"],
        jokes_or_interests: [],
        mentor_tips: [],
      }
      const msg = createPersonalizedMessage(memory, "encouragement")
      expect(msg).toContain("knifflig")
    })

    it("should create celebration message", () => {
      const memory = {
        student_name: "Zoey",
        learning_personality: "schnell",
        recent_achievements: ["Skill1", "Skill2", "Skill3"],
        recent_struggles: [],
        jokes_or_interests: [],
        mentor_tips: [],
      }
      const msg = createPersonalizedMessage(memory, "celebration")
      expect(msg).toContain("🎉")
      expect(msg).toContain("Zoey")
    })
  })

  // ========== LEARNING PERSONALITY DETECTION ==========
  describe("Learning Personality Detection", () => {
    it("should detect visual learner", () => {
      const personality = detectLearningPersonality({
        diagram_interactions: 10,
        explanation_requests: 2,
        attempt_count: 5,
        problem_difficulty_increases: 2,
        mentions_peers: 0,
        error_reactions: [],
        celebration_engagement: ["yes"],
      })
      expect(personality.is_visual_learner).toBeGreaterThan(0.7)
    })

    it("should detect independent learner (low help requests)", () => {
      const personality = detectLearningPersonality({
        diagram_interactions: 2,
        explanation_requests: 1,
        attempt_count: 8,
        problem_difficulty_increases: 4,
        mentions_peers: 0,
        error_reactions: [],
        celebration_engagement: ["yes", "yes"],
      })
      expect(personality.independent).toBeGreaterThan(0.8)
    })

    it("should detect perfectionist (frustrated by errors)", () => {
      const personality = detectLearningPersonality({
        diagram_interactions: 2,
        explanation_requests: 5,
        attempt_count: 2,
        problem_difficulty_increases: 0,
        mentions_peers: 0,
        error_reactions: ["frustrated", "disappointed"],
        celebration_engagement: [],
      })
      expect(personality.perfectionist).toBe(true)
    })
  })

  // ========== CELEBRATION LOGIC ==========
  describe("Celebration Scheduling", () => {
    it("should celebrate milestone achievements", () => {
      const should = shouldCelebrate(1, true) // Milestone reached
      expect(should).toBe(true)
    })

    it("should celebrate every 3rd correct answer", () => {
      expect(shouldCelebrate(3, false)).toBe(true) // 3rd
      expect(shouldCelebrate(6, false)).toBe(true) // 6th
      expect(shouldCelebrate(2, false)).toBe(false) // Not yet
    })

    it("should not over-celebrate daily", () => {
      expect(shouldCelebrate(1, false)).toBe(false) // Too soon
      expect(shouldCelebrate(2, false)).toBe(false) // Still too soon
    })
  })

  // ========== STREAK TRACKING ==========
  describe("Session Streak Tracking", () => {
    it("should start new streak if no session yesterday", () => {
      const current = {
        current_streak: 0,
        longest_streak: 0,
        last_session_date: new Date("2026-01-01"),
        sessions_this_week: 0,
        sessions_this_month: 0,
      }
      const today = new Date("2026-01-05")
      const updated = updateStreak(current, today)
      expect(updated.current_streak).toBe(1)
    })

    it("should continue streak if session yesterday", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const current = {
        current_streak: 5,
        longest_streak: 7,
        last_session_date: yesterday,
        sessions_this_week: 4,
        sessions_this_month: 15,
      }
      const updated = updateStreak(current, new Date())
      expect(updated.current_streak).toBe(6)
      expect(updated.longest_streak).toBe(7)
    })
  })

  // ========== MASTERY DESCRIPTION ==========
  describe("Mastery Level Descriptions", () => {
    it("should provide descriptions for all levels", () => {
      for (let level = 0; level <= 5; level++) {
        const desc = getMasteryDescription(level as any)
        expect(desc).toBeTruthy()
        expect(desc.length).toBeGreaterThan(0)
      }
    })

    it("Level 5 should mention mastery", () => {
      const desc = getMasteryDescription(5)
      expect(desc).toContain("Meistery")
    })
  })
})
