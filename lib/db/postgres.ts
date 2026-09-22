/**
 * PostgreSQL Database Client (Neon)
 *
 * This is the actual database implementation.
 * Uses node-postgres (pg) for connection pooling and CRUD operations.
 */

import { Pool, PoolClient, QueryResult } from "pg"
import {
  User,
  Topic,
  Subtopic,
  Task,
  Session,
  TaskAttempt,
  ErrorPattern,
  ReviewSchedule,
  Progress,
  AIUsageLog,
  DocumentMetadata,
  UUID,
  ProgressStatus,
  SessionStatus,
  AnalysisStatus,
  ErrorType,
} from "./types"

class PostgresDatabase {
  private pool: Pool
  private isConnected = false

  constructor() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err)
    })
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect()
      await client.query("SELECT 1")
      client.release()
      this.isConnected = true
      console.log("✓ Connected to PostgreSQL")
    } catch (error) {
      console.error("✗ Failed to connect to PostgreSQL:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end()
    this.isConnected = false
  }

  // ========== USERS ==========

  async createUser(name: string, age?: number): Promise<User> {
    const result = await this.pool.query<User>(
      `INSERT INTO users (name, age)
       VALUES ($1, $2)
       RETURNING *`,
      [name, age]
    )
    return result.rows[0]
  }

  async getUser(id: UUID): Promise<User | null> {
    const result = await this.pool.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    )
    return result.rows[0] || null
  }

  async getUserByName(name: string): Promise<User | null> {
    const result = await this.pool.query<User>(
      "SELECT * FROM users WHERE name = $1",
      [name]
    )
    return result.rows[0] || null
  }

  // ========== TOPICS ==========

  async createTopic(
    userId: UUID,
    title: string,
    emoji?: string,
    description?: string,
    difficulty_level?: number
  ): Promise<Topic> {
    const result = await this.pool.query<Topic>(
      `INSERT INTO topics (user_id, title, emoji, description, difficulty_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, emoji, description, difficulty_level || 1]
    )
    return result.rows[0]
  }

  async getTopicsByUser(userId: UUID): Promise<Topic[]> {
    const result = await this.pool.query<Topic>(
      "SELECT * FROM topics WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    )
    return result.rows
  }

  // ========== SUBTOPICS ==========

  async createSubtopic(
    topicId: UUID,
    title: string,
    description?: string
  ): Promise<Subtopic> {
    const result = await this.pool.query<Subtopic>(
      `INSERT INTO subtopics (topic_id, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [topicId, title, description]
    )
    return result.rows[0]
  }

  async getSubtopicsByTopic(topicId: UUID): Promise<Subtopic[]> {
    const result = await this.pool.query<Subtopic>(
      "SELECT * FROM subtopics WHERE topic_id = $1",
      [topicId]
    )
    return result.rows
  }

  // ========== TASKS ==========

  async createTask(
    subtopicId: UUID,
    title: string,
    problemStatement: string,
    solution?: string,
    solutionSteps?: any[],
    difficultyLevel?: number,
    category?: string
  ): Promise<Task> {
    const result = await this.pool.query<Task>(
      `INSERT INTO tasks
       (subtopic_id, title, problem_statement, solution, solution_steps, difficulty_level, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        subtopicId,
        title,
        problemStatement,
        solution,
        solutionSteps ? JSON.stringify(solutionSteps) : null,
        difficultyLevel || 1,
        category || "calculation",
      ]
    )
    return result.rows[0]
  }

  async getTasksBySubtopic(subtopicId: UUID): Promise<Task[]> {
    const result = await this.pool.query<Task>(
      "SELECT * FROM tasks WHERE subtopic_id = $1",
      [subtopicId]
    )
    return result.rows
  }

  // ========== SESSIONS ==========

  async createSession(
    userId: UUID,
    topicId: UUID,
    xpEarned?: number,
    status?: SessionStatus
  ): Promise<Session> {
    const result = await this.pool.query<Session>(
      `INSERT INTO sessions (user_id, topic_id, xp_earned, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, topicId, xpEarned || 0, status || "active"]
    )
    return result.rows[0]
  }

  async getSession(id: UUID): Promise<Session | null> {
    const result = await this.pool.query<Session>(
      "SELECT * FROM sessions WHERE id = $1",
      [id]
    )
    return result.rows[0] || null
  }

  async getUserSessions(userId: UUID): Promise<Session[]> {
    const result = await this.pool.query<Session>(
      "SELECT * FROM sessions WHERE user_id = $1 ORDER BY started_at DESC",
      [userId]
    )
    return result.rows
  }

  async completeSession(
    id: UUID,
    durationSeconds: number,
    xpEarned: number
  ): Promise<void> {
    await this.pool.query(
      `UPDATE sessions
       SET ended_at = CURRENT_TIMESTAMP,
           duration_seconds = $1,
           xp_earned = $2,
           status = 'completed'
       WHERE id = $3`,
      [durationSeconds, xpEarned, id]
    )
  }

  // ========== TASK ATTEMPTS ==========

  async createTaskAttempt(
    sessionId: UUID,
    taskId: UUID,
    userAnswer: string,
    isCorrect: boolean,
    helpLevel: number,
    classification: string,
    errorTypes?: ErrorType[]
  ): Promise<TaskAttempt> {
    const result = await this.pool.query<TaskAttempt>(
      `INSERT INTO task_attempts
       (session_id, task_id, user_answer, is_correct, help_level, classification, error_types, attempted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        sessionId,
        taskId,
        userAnswer,
        isCorrect,
        helpLevel,
        classification,
        errorTypes ? JSON.stringify(errorTypes) : null,
      ]
    )
    return result.rows[0]
  }

  async getTaskAttemptsInSession(sessionId: UUID): Promise<TaskAttempt[]> {
    const result = await this.pool.query<TaskAttempt>(
      "SELECT * FROM task_attempts WHERE session_id = $1 ORDER BY attempted_at",
      [sessionId]
    )
    return result.rows
  }

  // ========== ERROR PATTERNS ==========

  async recordErrorPattern(
    userId: UUID,
    topicId: UUID,
    errorType: ErrorType,
    errorDescription: string,
    frequency?: number
  ): Promise<ErrorPattern> {
    const result = await this.pool.query<ErrorPattern>(
      `INSERT INTO error_patterns
       (user_id, topic_id, error_type, error_description, frequency)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, topic_id, error_type)
       DO UPDATE SET frequency = frequency + $5
       RETURNING *`,
      [userId, topicId, errorType, errorDescription, frequency || 1]
    )
    return result.rows[0]
  }

  async getErrorPatterns(userId: UUID, topicId: UUID): Promise<ErrorPattern[]> {
    const result = await this.pool.query<ErrorPattern>(
      "SELECT * FROM error_patterns WHERE user_id = $1 AND topic_id = $2 ORDER BY frequency DESC",
      [userId, topicId]
    )
    return result.rows
  }

  // ========== PROGRESS ==========

  async upsertProgress(
    userId: UUID,
    topicId: UUID,
    status: ProgressStatus,
    successRate: number,
    totalAttempts: number,
    correctAttempts: number,
    independentCorrect: number
  ): Promise<Progress> {
    const result = await this.pool.query<Progress>(
      `INSERT INTO progress
       (user_id, topic_id, status, success_rate, total_attempts, correct_attempts, independent_correct)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, topic_id)
       DO UPDATE SET
         status = $3,
         success_rate = $4,
         total_attempts = $5,
         correct_attempts = $6,
         independent_correct = $7,
         last_updated = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId,
        topicId,
        status,
        successRate,
        totalAttempts,
        correctAttempts,
        independentCorrect,
      ]
    )
    return result.rows[0]
  }

  async getUserProgress(userId: UUID): Promise<Progress[]> {
    const result = await this.pool.query<Progress>(
      "SELECT * FROM progress WHERE user_id = $1 ORDER BY last_updated DESC",
      [userId]
    )
    return result.rows
  }

  // ========== AI USAGE LOGS ==========

  async logAIUsage(
    userId: UUID,
    useCase: string,
    modelUsed: string,
    inputTokens: number,
    outputTokens: number,
    totalCostUSD: number,
    success: boolean,
    errorMessage?: string,
    latencyMs?: number
  ): Promise<AIUsageLog> {
    const result = await this.pool.query<AIUsageLog>(
      `INSERT INTO ai_usage_logs
       (user_id, use_case, model_used, input_tokens, output_tokens, total_cost_usd, success, error_message, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        useCase,
        modelUsed,
        inputTokens,
        outputTokens,
        totalCostUSD,
        success,
        errorMessage,
        latencyMs,
      ]
    )
    return result.rows[0]
  }

  async getAIUsageLogs(userId: UUID, days?: number): Promise<AIUsageLog[]> {
    const query = days
      ? `SELECT * FROM ai_usage_logs
         WHERE user_id = $1
         AND api_call_timestamp > NOW() - INTERVAL '${days} days'
         ORDER BY api_call_timestamp DESC`
      : `SELECT * FROM ai_usage_logs
         WHERE user_id = $1
         ORDER BY api_call_timestamp DESC`

    const result = await this.pool.query<AIUsageLog>(query, [userId])
    return result.rows
  }

  // ========== DOCUMENT METADATA ==========

  async createDocumentMetadata(
    userId: UUID,
    fileType: "image" | "pdf",
    storageKey: string,
    fileSizeBytes: number,
    expiresAt?: Date
  ): Promise<DocumentMetadata> {
    const result = await this.pool.query<DocumentMetadata>(
      `INSERT INTO document_metadata
       (user_id, file_type, storage_key, file_size_bytes, expires_at, analysis_status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [userId, fileType, storageKey, fileSizeBytes, expiresAt]
    )
    return result.rows[0]
  }

  async updateDocumentAnalysis(
    id: UUID,
    analysisResult: any,
    status: AnalysisStatus
  ): Promise<void> {
    await this.pool.query(
      `UPDATE document_metadata
       SET analysis_result = $1, analysis_status = $2
       WHERE id = $3`,
      [JSON.stringify(analysisResult), status, id]
    )
  }

  async getDocument(id: UUID): Promise<DocumentMetadata | null> {
    const result = await this.pool.query<DocumentMetadata>(
      "SELECT * FROM document_metadata WHERE id = $1",
      [id]
    )
    return result.rows[0] || null
  }

  // ========== PARENT ACCESS ==========

  async createParentAccessSession(
    userId: UUID | string,
    sessionToken: string,
    expiresAt: Date
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO parent_access_sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, sessionToken, expiresAt]
    )
  }

  async getParentSession(sessionToken: string): Promise<any | null> {
    const result = await this.pool.query(
      `SELECT * FROM parent_access_sessions
       WHERE session_token = $1
       AND expires_at > CURRENT_TIMESTAMP`,
      [sessionToken]
    )
    return result.rows[0] || null
  }

  async deleteParentSession(sessionToken: string): Promise<void> {
    await this.pool.query(
      "DELETE FROM parent_access_sessions WHERE session_token = $1",
      [sessionToken]
    )
  }

  // ========== HELPERS ==========

  async health(): Promise<boolean> {
    try {
      const result = await this.pool.query("SELECT 1")
      return result.rows.length > 0
    } catch {
      return false
    }
  }

  // ========== CLEANUP OPERATIONS ==========

  async getExpiredDocuments(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT id, storage_key, file_type, expires_at
       FROM document_metadata
       WHERE expires_at < CURRENT_TIMESTAMP
       AND is_deleted = FALSE
       ORDER BY expires_at ASC`
    )
    return result.rows
  }

  async markDocumentDeleted(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE document_metadata
       SET is_deleted = TRUE,
           deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [id]
    )
  }

  async deleteExpiredParentSessions(): Promise<number> {
    const result = await this.pool.query(
      `DELETE FROM parent_access_sessions
       WHERE expires_at < CURRENT_TIMESTAMP`
    )
    return result.rowCount || 0
  }
}

// Singleton instance
let dbInstance: PostgresDatabase | null = null

export function getDatabase(): PostgresDatabase {
  if (!dbInstance) {
    dbInstance = new PostgresDatabase()
  }
  return dbInstance
}

export async function initializeDatabase(): Promise<void> {
  const db = getDatabase()
  await db.connect()
}

export type { PostgresDatabase }
