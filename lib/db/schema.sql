-- ========== ELI LEARNING PLATFORM DATABASE SCHEMA ==========
-- PostgreSQL (Neon)
-- This schema defines persistent learning data for Zoey

-- ========== CORE TABLES ==========

-- Users (Student)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  age INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics (Math topics like "Bruchrechnung", "Negative Zahlen")
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  difficulty_level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);

-- Subtopics (e.g., "Bruchrechnung" has "Addition", "Subtraktion")
CREATE TABLE IF NOT EXISTS subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subtopics_topic_id ON subtopics(topic_id);

-- Tasks (Individual math problems)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id UUID NOT NULL REFERENCES subtopics(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  problem_statement TEXT NOT NULL,
  solution TEXT,
  solution_steps JSONB, -- Array of steps for explanation
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  category VARCHAR(50), -- "calculation", "problem_solving", "conceptual"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_subtopic_id ON tasks(subtopic_id);

-- Sessions (Learning sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  xp_earned INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);

-- Task Attempts (Each attempt at solving a task)
CREATE TABLE IF NOT EXISTS task_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN,
  help_level INTEGER DEFAULT 0, -- 0-5: how much help was needed
  classification VARCHAR(50), -- 'A' (correct), 'B', 'C', 'D', 'E', 'F' (wrong)
  error_types JSONB, -- Array of error classifications
  time_spent_seconds INTEGER,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_task_attempts_session_id ON task_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_task_attempts_task_id ON task_attempts(task_id);

-- ========== ELI MEMORY & ANALYTICS ==========

-- Error Patterns (What mistakes does Zoey make repeatedly?)
CREATE TABLE IF NOT EXISTS error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  error_type VARCHAR(100), -- "sign_error", "calculation_error", "conceptual_misunderstanding"
  error_description TEXT,
  frequency INTEGER DEFAULT 1, -- how many times this error occurred
  last_occurred TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  requires_intervention BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_error_patterns_user_id ON error_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_error_patterns_topic_id ON error_patterns(topic_id);

-- Review Schedule (Spaced Repetition)
CREATE TABLE IF NOT EXISTS review_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  next_review_date DATE,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'overdue'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_schedules_user_id ON review_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_review_schedules_next_review_date ON review_schedules(next_review_date);

-- Progress (Overall mastery status per topic)
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'learning', 'proficient', 'mastered'
  success_rate DECIMAL(5, 2) DEFAULT 0, -- 0-100%
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  independent_correct INTEGER DEFAULT 0, -- without help
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_user_topic ON progress(user_id, topic_id);

-- ========== AI USAGE & COST TRACKING ==========

-- AI Usage Log (for cost monitoring and debugging)
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  use_case VARCHAR(100), -- 'document_analysis', 'image_analysis', 'text_generation', 'classification'
  model_used VARCHAR(100), -- e.g., 'gpt-4o', 'gpt-4o-mini'
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_cost_usd DECIMAL(10, 6),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  latency_ms INTEGER,
  api_call_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_api_call_timestamp ON ai_usage_logs(api_call_timestamp DESC);

-- ========== TEMPORARY/TRANSIENT TABLES ==========

-- Document Metadata (uploaded files - soft deleted after analysis)
CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_type VARCHAR(50), -- 'image', 'pdf'
  storage_key VARCHAR(500), -- path in Vercel Blob
  file_size_bytes INTEGER,
  upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  analysis_result JSONB, -- structured result from OpenAI
  analysis_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  expires_at TIMESTAMP, -- when to delete from storage
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_metadata_user_id ON document_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_expires_at ON document_metadata(expires_at);

-- Parent Access Sessions (for dashboard PIN auth)
CREATE TABLE IF NOT EXISTS parent_access_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parent_access_sessions_expires_at ON parent_access_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_parent_access_sessions_session_token ON parent_access_sessions(session_token);

-- ========== VIEWS FOR COMMON QUERIES ==========

-- User's current proficiency status
CREATE OR REPLACE VIEW user_topic_status AS
SELECT
  p.user_id,
  p.topic_id,
  t.title,
  t.emoji,
  p.status,
  p.success_rate,
  p.correct_attempts,
  p.total_attempts,
  CASE
    WHEN p.status = 'mastered' THEN 'green'
    WHEN p.status = 'proficient' THEN 'green'
    WHEN p.status = 'learning' THEN 'yellow'
    ELSE 'red'
  END as status_color
FROM progress p
JOIN topics t ON p.topic_id = t.id
ORDER BY t.created_at DESC;

-- Recent learning activity
CREATE OR REPLACE VIEW user_recent_activity AS
SELECT
  s.user_id,
  s.id as session_id,
  t.title as topic_title,
  COUNT(ta.id) as task_count,
  SUM(CASE WHEN ta.is_correct THEN 1 ELSE 0 END) as correct_count,
  s.started_at,
  s.xp_earned
FROM sessions s
JOIN topics t ON s.topic_id = t.id
LEFT JOIN task_attempts ta ON s.id = ta.session_id
GROUP BY s.id, s.user_id, t.title
ORDER BY s.started_at DESC;

-- ========== MATHEMATICAL FOUNDATION POOL ==========

-- Grundlagen (Mathematical foundations)
CREATE TABLE IF NOT EXISTS foundations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL, -- e.g., "addition", "negative_numbers", "fractions"
  german_name VARCHAR(255) NOT NULL, -- e.g., "Addition", "Negative Zahlen"
  description TEXT,
  category VARCHAR(100), -- "basic_arithmetic", "numbers", "fractions", "equations", "geometry"
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  order_index INTEGER, -- for displaying in sequence
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_foundations_key ON foundations(key);
CREATE INDEX IF NOT EXISTS idx_foundations_category ON foundations(category);

-- Foundation dependencies (which foundations are required for others)
CREATE TABLE IF NOT EXISTS foundation_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id UUID NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  is_direct BOOLEAN DEFAULT TRUE, -- direct vs. indirect dependency
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_foundation_dependencies_foundation_id ON foundation_dependencies(foundation_id);
CREATE INDEX IF NOT EXISTS idx_foundation_dependencies_prerequisite_id ON foundation_dependencies(prerequisite_id);

-- User's mastery of each foundation
CREATE TABLE IF NOT EXISTS foundation_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  foundation_id UUID NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  mastery_level VARCHAR(50) DEFAULT 'untested', -- 'untested', 'uncertain', 'weak', 'secure', 'mastered'
  last_assessed TIMESTAMP,
  last_review_date DATE,
  review_count INTEGER DEFAULT 0,
  consecutive_correct INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, foundation_id)
);

CREATE INDEX IF NOT EXISTS idx_foundation_mastery_user_id ON foundation_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_foundation_mastery_foundation_id ON foundation_mastery(foundation_id);
CREATE INDEX IF NOT EXISTS idx_foundation_mastery_mastery_level ON foundation_mastery(mastery_level);

-- Topic to foundation mapping (which topics need which foundations)
CREATE TABLE IF NOT EXISTS topic_foundation_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  foundation_id UUID NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  is_critical BOOLEAN DEFAULT FALSE, -- must-have vs. nice-to-have
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topic_foundation_requirements_topic_id ON topic_foundation_requirements(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_foundation_requirements_foundation_id ON topic_foundation_requirements(foundation_id);
