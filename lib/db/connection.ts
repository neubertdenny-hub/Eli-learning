import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"

let db: ReturnType<typeof drizzle> | null = null

export function getDatabase() {
  if (!db) {
    try {
      const sqlite = new Database("./eli-learning.db")
      sqlite.pragma("journal_mode = WAL")
      db = drizzle(sqlite, { schema })
    } catch (error) {
      console.error("Database connection failed:", error)
      throw error
    }
  }
  return db
}

export async function initializeDatabase() {
  try {
    const db = getDatabase()
    console.log("✅ Database initialized successfully")
    return db
  } catch (error) {
    console.error("❌ Failed to initialize database:", error)
    throw error
  }
}
