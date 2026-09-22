/**
 * Database Model Types
 * Typed representations of all tables in PostgreSQL
 */

// UUID type - used as string at runtime but branded for type safety
export type UUID = string

export type ProgressStatus = "new" | "learning" | "proficient" | "mastered"
export type SessionStatus = "active" | "completed" | "abandoned"
export type AnalysisStatus = "pending" | "completed" | "failed"
export type FileType = "image" | "pdf"

// ========== CORE TYPES ==========

export interface User {
  id: UUID
  name: string
  age?: number
  created_at: Date
  updated_at: Date
}

export interface Topic {
  id: UUID
  user_id: UUID
  title: string
  emoji?: string
  description?: string
  difficulty_level: number
  created_at: Date
  updated_at: Date
}

export interface Subtopic {
  id: UUID
  topic_id: UUID
  title: string
  description?: string
  created_at: Date
}

export interface Task {
  id: UUID
  subtopic_id: UUID
  title: string
  description?: string
  problem_statement: string
  solution?: string
  solution_steps?: SolutionStep[]
  difficulty_level: number
  category: "calculation" | "problem_solving" | "conceptual"
  created_at: Date
}

export interface SolutionStep {
  step_number: number
  description: string
  explanation: string
  visual_hint?: string
}

export interface Session {
  id: UUID
  user_id: UUID
  topic_id: UUID
  started_at: Date
  ended_at?: Date
  duration_seconds?: number
  xp_earned: number
  status: SessionStatus
  created_at: Date
}

export interface TaskAttempt {
  id: UUID
  session_id: UUID
  task_id: UUID
  user_answer: string
  is_correct: boolean
  help_level: number // 0-5
  classification: "A" | "B" | "C" | "D" | "E" | "F"
  error_types?: ErrorType[]
  time_spent_seconds?: number
  attempted_at: Date
}

// ========== ERROR TRACKING ==========

export type ErrorType =
  | "sign_error"
  | "calculation_error"
  | "conceptual_misunderstanding"
  | "procedural_error"
  | "careless_mistake"
  | "incomplete_solution"
  | "notation_error"

export interface ErrorPattern {
  id: UUID
  user_id: UUID
  topic_id: UUID
  error_type: ErrorType
  error_description: string
  frequency: number
  last_occurred: Date
  requires_intervention: boolean
  created_at: Date
}

// ========== LEARNING ANALYTICS ==========

export interface ReviewSchedule {
  id: UUID
  user_id: UUID
  topic_id: UUID
  next_review_date: Date
  review_count: number
  last_reviewed?: Date
  status: "pending" | "completed" | "overdue"
  created_at: Date
}

export interface Progress {
  id: UUID
  user_id: UUID
  topic_id: UUID
  status: ProgressStatus
  success_rate: number // 0-100
  total_attempts: number
  correct_attempts: number
  independent_correct: number
  last_updated: Date
  created_at: Date
}

// ========== AI & COST TRACKING ==========

export interface AIUsageLog {
  id: UUID
  user_id: UUID
  use_case: "document_analysis" | "image_analysis" | "text_generation" | "classification"
  model_used: string // e.g., "gpt-4o"
  input_tokens?: number
  output_tokens?: number
  total_cost_usd: number
  success: boolean
  error_message?: string
  latency_ms: number
  api_call_timestamp: Date
  created_at: Date
}

// ========== DOCUMENT TRACKING ==========

export interface DocumentMetadata {
  id: UUID
  user_id: UUID
  file_type: FileType
  storage_key: string // path in Vercel Blob
  file_size_bytes: number
  upload_timestamp: Date
  analysis_result?: DocumentAnalysisResult
  analysis_status: AnalysisStatus
  expires_at?: Date
  is_deleted: boolean
  deleted_at?: Date
  created_at: Date
}

// ========== PARENT ACCESS ==========

export interface ParentAccessSession {
  id: UUID
  user_id: UUID
  session_token: string
  expires_at: Date
  created_at: Date
}

// ========== AI ANALYSIS RESULTS ==========

export interface DocumentAnalysisResult {
  confidence: number // 0-1
  detected_topics: DetectedTopic[]
  mathematical_content: MathematicalContent
  recommended_tasks: RecommendedTask[]
  uncertainty_notes?: string[]
  raw_text?: string
}

export interface DetectedTopic {
  topic_name: string
  subtopic_name?: string
  confidence: number
  key_concepts: string[]
}

export interface MathematicalContent {
  problem_type: string
  difficulty_level: number // 1-5
  required_knowledge: string[]
  key_skills: string[]
  error_prone_areas: string[]
}

export interface RecommendedTask {
  title: string
  description: string
  difficulty_level: number
  estimated_time_minutes: number
}

export interface ClassificationResult {
  is_correct: boolean
  confidence: number // 0-1
  error_type?: ErrorType
  explanation: string
  help_suggestion?: HelpSuggestion
}

export interface HelpSuggestion {
  help_level: number // 1-5
  intervention_type: "hint" | "step_by_step" | "explain_concept" | "similar_problem"
  suggestion_text: string
}

// ========== VIEW TYPES ==========

export interface UserTopicStatus {
  user_id: UUID
  topic_id: UUID
  title: string
  emoji?: string
  status: ProgressStatus
  success_rate: number
  correct_attempts: number
  total_attempts: number
  status_color: "green" | "yellow" | "red"
}

export interface UserRecentActivity {
  user_id: UUID
  session_id: UUID
  topic_title: string
  task_count: number
  correct_count: number
  started_at: Date
  xp_earned: number
}
