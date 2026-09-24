import { sql } from "drizzle-orm"
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

// Users & Learning Progress
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const skillMastery = sqliteTable("skill_mastery", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  skillName: text("skill_name").notNull(),
  currentLevel: integer("current_level").default(0), // 0-5
  masteryConfidence: integer("mastery_confidence").default(100), // 0-100
  attempts: integer("attempts").default(0),
  correctAttempts: integer("correct_attempts").default(0),
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  lastPracticed: text("last_practiced").default(sql`CURRENT_TIMESTAMP`),
  nextReview: text("next_review"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// School Topics
export const schoolTopicSignals = sqliteTable("school_topic_signals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  topicId: text("topic_id").notNull(),
  topicName: text("topic_name").notNull(),
  firstSeenAt: text("first_seen_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  uploadFrequency: integer("upload_frequency").default(0),
  recentTaskCount: integer("recent_task_count").default(0),
  relevanceScore: integer("relevance_score").default(0),
  sources: text("sources"), // JSON array
  masteryLevel: integer("mastery_level").default(0),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Learning Missions
export const learningMissions = sqliteTable("learning_missions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  date: text("date").notNull(),
  status: text("status").default("planned"), // planned, in_progress, completed, paused
  targetMinutes: integer("target_minutes").default(20),
  activeLearningSeconds: integer("active_learning_seconds").default(0),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  xpEarned: integer("xp_earned").default(0),
  selectionReasoning: text("selection_reasoning"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Mission Blocks
export const missionBlocks = sqliteTable("mission_blocks", {
  id: text("id").primaryKey(),
  missionId: text("mission_id")
    .notNull()
    .references(() => learningMissions.id),
  type: text("type").notNull(), // WARM_UP, CURRENT_SCHOOL_TOPIC, etc.
  blockOrder: integer("block_order").notNull(),
  topicId: text("topic_id").notNull(),
  topicName: text("topic_name").notNull(),
  targetTaskCount: integer("target_task_count").default(0),
  completedTaskCount: integer("completed_task_count").default(0),
  estimatedMinutes: integer("estimated_minutes").default(5),
  selectionReason: text("selection_reason").notNull(),
  blockStatus: text("block_status").default("pending"), // pending, in_progress, completed, skipped
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Mission Adjustments (Adaptive Changes)
export const missionAdjustments = sqliteTable("mission_adjustments", {
  id: text("id").primaryKey(),
  missionId: text("mission_id")
    .notNull()
    .references(() => learningMissions.id),
  adjustmentTimestamp: text("adjustment_timestamp").notNull(),
  reason: text("reason").notNull(),
  previousBlockOrder: text("previous_block_order"), // JSON
  newBlockOrder: text("new_block_order"), // JSON
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Session Memory (Eli Memory)
export const sessionMemory = sqliteTable("session_memory", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  missionId: text("mission_id")
    .notNull()
    .references(() => learningMissions.id),
  detectedFoundationGaps: text("detected_foundation_gaps"), // JSON array
  performanceMetrics: text("performance_metrics"), // JSON
  adaptiveScalingFactors: text("adaptive_scaling_factors"), // JSON
  learningSignals: text("learning_signals"), // JSON
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// XP & Levels
export const xpSystem = sqliteTable("xp_system", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  totalXp: integer("total_xp").default(0),
  currentLevel: integer("current_level").default(0),
  currentStreak: integer("current_streak").default(0),
  bestStreak: integer("best_streak").default(0),
  lastStreakDate: text("last_streak_date"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Parent Dashboard Data
export const parentDashboardMetrics = sqliteTable(
  "parent_dashboard_metrics",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    date: text("date").notNull(),
    weeklyMissionsCompleted: integer("weekly_missions_completed").default(0),
    weeklyXpEarned: integer("weekly_xp_earned").default(0),
    monthlyMissionsCompleted: integer("monthly_missions_completed").default(0),
    monthlyXpEarned: integer("monthly_xp_earned").default(0),
    learningHours: real("learning_hours").default(0),
    consistencyPercentage: integer("consistency_percentage").default(0),
    masterySummary: text("mastery_summary"), // JSON
    createdAt: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: text("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }
)

// School Tasks & Materials
export const schoolTasks = sqliteTable("school_tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  topicId: text("topic_id").notNull(),
  source: text("source").notNull(), // school_upload, ai_generated
  problem: text("problem").notNull(),
  solution: text("solution"),
  difficulty: integer("difficulty").default(2), // 1-5
  category: text("category").default("calculation"),
  uploadedAt: text("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
  usageCount: integer("usage_count").default(0),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Task Variants & Explanations
export const taskVariants = sqliteTable("task_variants", {
  id: text("id").primaryKey(),
  originalTaskId: text("original_task_id")
    .notNull()
    .references(() => schoolTasks.id),
  variantProblem: text("variant_problem").notNull(),
  variantSolution: text("variant_solution"),
  explanation: text("explanation"), // JSON (Step 1, 2, 3, Key Insight, Common Mistake)
  difficulty: integer("difficulty").default(2),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Reward Events (Phase 6)
export const rewardEvents = sqliteTable("reward_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  eventType: text("event_type").notNull(), // TASK_CORRECT_INDEPENDENT, SELF_CORRECTION, etc.
  sourceId: text("source_id").notNull(), // taskAttemptId, missionId, etc.
  xpAmount: integer("xp_amount").notNull(),
  coinsAmount: integer("coins_amount").default(0),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// User Rewards (Phase 6)
export const userRewards = sqliteTable("user_rewards", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  totalXp: integer("total_xp").default(0),
  totalCoins: integer("total_coins").default(0),
  currentLevel: integer("current_level").default(1),
  lastRewardAt: text("last_reward_at"),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Badges (Phase 6)
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(), // "first_step", "on_fire", etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  requirement: text("requirement").notNull(), // JSON: {type: "missions_completed", value: 1}
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// User Badges (Phase 6)
export const userBadges = sqliteTable("user_badges", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  badgeId: text("badge_id")
    .notNull()
    .references(() => badges.id),
  unlockedAt: text("unlocked_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Learning Streaks (Phase 6)
export const learningStreaks = sqliteTable("learning_streaks", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  currentStreak: integer("current_streak").default(0), // Anzahl aufeinanderfolgender Lerntage
  bestStreak: integer("best_streak").default(0),
  lastActiveDate: text("last_active_date"), // Letzter Tag mit echten Lernaktivitäten
  streakFreezeUsed: integer("streak_freeze_used").default(0), // Anzahl verwendet
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Cosmetic Items (Phase 6)
export const cosmeticItems = sqliteTable("cosmetic_items", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(), // "cap", "weltraum_bg", etc.
  name: text("name").notNull(),
  category: text("category").notNull(), // accessory, background, color, etc.
  unlocksAt: integer("unlocks_at").default(1), // Level requirement
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// User Cosmetics (Phase 6)
export const userCosmetics = sqliteTable("user_cosmetics", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  cosmeticId: text("cosmetic_id")
    .notNull()
    .references(() => cosmeticItems.id),
  unlockedAt: text("unlocked_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// User Equipped Cosmetics (Phase 6)
export const userEquippedCosmetics = sqliteTable("user_equipped_cosmetics", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  headColor: text("head_color").default("blue"), // Eli Kopffarbe
  accessory: text("accessory"), // cosmeticId
  background: text("background"), // cosmeticId
  outfit: text("outfit"), // cosmeticId (Kleidung/Shirt/Hoodie/Jacke)
  shoes: text("shoes"), // cosmeticId (Schuhe)
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Daily Challenges (Phase 6F-A)
export const dailyChallengeProgress = sqliteTable("daily_challenge_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  challengeId: text("challenge_id").notNull(), // "solve_5", "level_up_1", etc.
  date: text("date").notNull(), // YYYY-MM-DD für täglich Reset
  currentProgress: integer("current_progress").default(0),
  completed: integer("completed").default(0), // 0 = false, 1 = true
  completedAt: text("completed_at"),
  rewardsClaimed: integer("rewards_claimed").default(0),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export type User = typeof users.$inferSelect
export type SkillMastery = typeof skillMastery.$inferSelect
export type LearningMission = typeof learningMissions.$inferSelect
export type MissionBlock = typeof missionBlocks.$inferSelect
export type SchoolTopicSignal = typeof schoolTopicSignals.$inferSelect
export type SchoolTask = typeof schoolTasks.$inferSelect
export type TaskVariant = typeof taskVariants.$inferSelect
export type XPSystem = typeof xpSystem.$inferSelect
export type RewardEvent = typeof rewardEvents.$inferSelect
export type UserRewards = typeof userRewards.$inferSelect
export type Badge = typeof badges.$inferSelect
export type UserBadge = typeof userBadges.$inferSelect
export type LearningStreak = typeof learningStreaks.$inferSelect
export type CosmeticItem = typeof cosmeticItems.$inferSelect
export type UserCosmetic = typeof userCosmetics.$inferSelect
export type UserEquippedCosmetic = typeof userEquippedCosmetics.$inferSelect
export type DailyChallengeProgress = typeof dailyChallengeProgress.$inferSelect
