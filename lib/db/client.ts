/**
 * Database Client Interface
 *
 * Abstract database operations.
 * Current implementation: Vercel Postgres (via Neon)
 * Can be swapped for any PostgreSQL-compatible database
 */

import type { Session, TaskAttempt, EliMemory, ProgressEntry, Task, Theme, Subtopic } from "@/lib/types"

export interface DatabaseClient {
  // ========== CONNECTION MANAGEMENT ==========
  connect(): Promise<void>
  disconnect(): Promise<void>
  health(): Promise<boolean>

  // ========== SESSIONS (Core Learning Data - PERSISTENT) ==========
  sessions: {
    save(session: Session): Promise<void>
    get(id: string): Promise<Session | null>
    list(userId: string, limit?: number): Promise<Session[]>
    update(session: Partial<Session>): Promise<void>
  }

  // ========== TASK ATTEMPTS (Individual Attempts - PERSISTENT) ==========
  taskAttempts: {
    save(attempt: TaskAttempt): Promise<void>
    get(id: string): Promise<TaskAttempt | null>
    listBySession(sessionId: string): Promise<TaskAttempt[]>
    listByTask(taskId: string, limit?: number): Promise<TaskAttempt[]>
  }

  // ========== ELI MEMORY (Learning Profile - PERSISTENT) ==========
  eliMemory: {
    get(userId: string): Promise<EliMemory | null>
    update(userId: string, data: Partial<EliMemory>): Promise<void>
    upsert(userId: string, data: EliMemory): Promise<void>
  }

  // ========== PROGRESS (Aggregated Statistics - PERSISTENT) ==========
  progress: {
    save(entry: ProgressEntry): Promise<void>
    get(userId: string, date: Date): Promise<ProgressEntry | null>
    list(userId: string, days?: number): Promise<ProgressEntry[]>
  }

  // ========== THEMES (Math Topics) ==========
  themes: {
    save(theme: Theme): Promise<void>
    get(id: string): Promise<Theme | null>
    list(): Promise<Theme[]>
    update(id: string, data: Partial<Theme>): Promise<void>
  }

  // ========== TASKS (Math Exercises) ==========
  tasks: {
    save(task: Task): Promise<void>
    get(id: string): Promise<Task | null>
    listBySubtopic(subtopicId: string): Promise<Task[]>
    listByDifficulty(difficulty: number): Promise<Task[]>
  }

  // ========== SUBTOPICS ==========
  subtopics: {
    save(subtopic: Subtopic): Promise<void>
    get(id: string): Promise<Subtopic | null>
    listByTheme(themeId: string): Promise<Subtopic[]>
  }
}

// ========== SINGLETON INSTANCE ==========

let dbClient: DatabaseClient | null = null

export async function initializeDatabase(): Promise<DatabaseClient> {
  if (dbClient) {
    return dbClient
  }

  // Import actual implementation (added in Phase 2)
  // For now: placeholder
  throw new Error("Database client not initialized. Use setDatabaseClient() to provide implementation.")
}

export function setDatabaseClient(client: DatabaseClient) {
  dbClient = client
}

export function getDatabase(): DatabaseClient {
  if (!dbClient) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    )
  }
  return dbClient
}
