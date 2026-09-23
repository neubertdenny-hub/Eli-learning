/**
 * Phase 5 Database Schema
 *
 * Neue Tabellen für Mission Planner:
 * - learning_missions
 * - mission_blocks
 * - mission_adjustments
 * - school_topic_signals
 */

export const PHASE5_SCHEMA = {
  learning_missions: {
    id: "TEXT PRIMARY KEY",
    userId: "TEXT NOT NULL",
    date: "TEXT NOT NULL", // ISO date
    status: "TEXT DEFAULT 'planned'", // planned, in_progress, completed, paused
    targetMinutes: "INTEGER DEFAULT 20",
    activeLearningSeconds: "INTEGER DEFAULT 0",
    startedAt: "TEXT",
    completedAt: "TEXT",
    xpEarned: "INTEGER DEFAULT 0",
    selectionReasoning: "TEXT",
    createdAt: "TEXT DEFAULT CURRENT_TIMESTAMP",
    updatedAt: "TEXT DEFAULT CURRENT_TIMESTAMP",
  },

  mission_blocks: {
    id: "TEXT PRIMARY KEY",
    missionId: "TEXT NOT NULL REFERENCES learning_missions(id)",
    type: "TEXT NOT NULL", // WARM_UP, CURRENT_SCHOOL_TOPIC, FOUNDATION_REPAIR, REVIEW, PRACTICE, CHALLENGE, TRANSFER_CHECK, DIAGNOSIS
    blockOrder: "INTEGER NOT NULL",
    topicId: "TEXT NOT NULL",
    topicName: "TEXT NOT NULL",
    targetTaskCount: "INTEGER DEFAULT 0",
    completedTaskCount: "INTEGER DEFAULT 0",
    estimatedMinutes: "INTEGER DEFAULT 5",
    selectionReason: "TEXT NOT NULL", // CURRENT_SCHOOL_TOPIC, FOUNDATION_GAP, REVIEW_DUE, etc.
    blockStatus: "TEXT DEFAULT 'pending'", // pending, in_progress, completed, skipped
    createdAt: "TEXT DEFAULT CURRENT_TIMESTAMP",
  },

  mission_adjustments: {
    id: "TEXT PRIMARY KEY",
    missionId: "TEXT NOT NULL REFERENCES learning_missions(id)",
    adjustmentTimestamp: "TEXT NOT NULL",
    reason: "TEXT NOT NULL", // FOUNDATION_GAP_DETECTED, DIFFICULTY_TOO_HIGH, PERFECT_STREAK, etc.
    previousBlockOrder: "TEXT", // JSON serialized
    newBlockOrder: "TEXT", // JSON serialized
    createdAt: "TEXT DEFAULT CURRENT_TIMESTAMP",
  },

  school_topic_signals: {
    userId: "TEXT NOT NULL",
    topicId: "TEXT NOT NULL",
    topicName: "TEXT NOT NULL",
    firstSeenAt: "TEXT NOT NULL",
    lastSeenAt: "TEXT NOT NULL",
    uploadFrequency: "INTEGER DEFAULT 0",
    recentTaskCount: "INTEGER DEFAULT 0",
    relevanceScore: "INTEGER DEFAULT 0",
    sources: "TEXT", // JSON array: ["upload", "practice", "error"]
    masteryLevel: "INTEGER DEFAULT 0", // 0-5
    PRIMARY: "KEY (userId, topicId)",
  },

  session_memory: {
    id: "TEXT PRIMARY KEY",
    userId: "TEXT NOT NULL",
    missionId: "TEXT NOT NULL REFERENCES learning_missions(id)",
    detectedFoundationGaps: "TEXT", // JSON array
    performanceMetrics: "TEXT", // JSON
    adultiveScalingFactors: "TEXT", // JSON
    learningSignals: "TEXT", // JSON
    createdAt: "TEXT DEFAULT CURRENT_TIMESTAMP",
  },
}

export const PHASE5_MIGRATIONS = `
-- Phase 5A Migrations

-- learning_missions Tabelle
CREATE TABLE IF NOT EXISTS learning_missions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'planned',
  targetMinutes INTEGER DEFAULT 20,
  activeLearningSeconds INTEGER DEFAULT 0,
  startedAt TEXT,
  completedAt TEXT,
  xpEarned INTEGER DEFAULT 0,
  selectionReasoning TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_missions_user_date ON learning_missions(userId, date);

-- mission_blocks Tabelle
CREATE TABLE IF NOT EXISTS mission_blocks (
  id TEXT PRIMARY KEY,
  missionId TEXT NOT NULL REFERENCES learning_missions(id),
  type TEXT NOT NULL,
  blockOrder INTEGER NOT NULL,
  topicId TEXT NOT NULL,
  topicName TEXT NOT NULL,
  targetTaskCount INTEGER DEFAULT 0,
  completedTaskCount INTEGER DEFAULT 0,
  estimatedMinutes INTEGER DEFAULT 5,
  selectionReason TEXT NOT NULL,
  blockStatus TEXT DEFAULT 'pending',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mission_blocks_mission ON mission_blocks(missionId);

-- mission_adjustments Tabelle
CREATE TABLE IF NOT EXISTS mission_adjustments (
  id TEXT PRIMARY KEY,
  missionId TEXT NOT NULL REFERENCES learning_missions(id),
  adjustmentTimestamp TEXT NOT NULL,
  reason TEXT NOT NULL,
  previousBlockOrder TEXT,
  newBlockOrder TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_adjustments_mission ON mission_adjustments(missionId);

-- school_topic_signals Tabelle
CREATE TABLE IF NOT EXISTS school_topic_signals (
  userId TEXT NOT NULL,
  topicId TEXT NOT NULL,
  topicName TEXT NOT NULL,
  firstSeenAt TEXT NOT NULL,
  lastSeenAt TEXT NOT NULL,
  uploadFrequency INTEGER DEFAULT 0,
  recentTaskCount INTEGER DEFAULT 0,
  relevanceScore INTEGER DEFAULT 0,
  sources TEXT,
  masteryLevel INTEGER DEFAULT 0,
  PRIMARY KEY (userId, topicId)
);

CREATE INDEX IF NOT EXISTS idx_topics_relevance ON school_topic_signals(userId, relevanceScore DESC);

-- session_memory Tabelle
CREATE TABLE IF NOT EXISTS session_memory (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  missionId TEXT NOT NULL REFERENCES learning_missions(id),
  detectedFoundationGaps TEXT,
  performanceMetrics TEXT,
  adultiveScalingFactors TEXT,
  learningSignals TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_session_memory_mission ON session_memory(missionId);
`
