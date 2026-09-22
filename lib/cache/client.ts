/**
 * Cache Client Interface (Redis/KV)
 *
 * For: Fast reads of active sessions, undo/redo stacks, temporary data
 * Current: Vercel KV or Upstash Redis
 * TTL: Typically 7 days for active data
 */

export interface CacheClient {
  // ========== CONNECTION ==========
  connect(): Promise<void>
  disconnect(): Promise<void>
  health(): Promise<boolean>

  // ========== KEY-VALUE OPERATIONS ==========
  set(
    key: string,
    value: any,
    options?: { exSeconds?: number; exAt?: Date }
  ): Promise<void>

  get(key: string): Promise<any | null>

  delete(key: string): Promise<boolean>

  exists(key: string): Promise<boolean>

  // ========== LIST OPERATIONS ==========
  lpush(key: string, value: any): Promise<number>
  lpop(key: string): Promise<any | null>
  lrange(key: string, start: number, end: number): Promise<any[]>
  ltrim(key: string, start: number, end: number): Promise<void>
  llen(key: string): Promise<number>

  // ========== EXPIRY ==========
  expire(key: string, exSeconds: number): Promise<boolean>
  ttl(key: string): Promise<number> // -1 if no expiry, -2 if not exists
}

// ========== SINGLETON INSTANCE ==========

let cacheClient: CacheClient | null = null

export async function initializeCache(): Promise<CacheClient> {
  if (cacheClient) {
    return cacheClient
  }

  throw new Error("Cache client not initialized. Use setCacheClient() to provide implementation.")
}

export function setCacheClient(client: CacheClient) {
  cacheClient = client
}

export function getCache(): CacheClient {
  if (!cacheClient) {
    throw new Error("Cache not initialized. Call initializeCache() first.")
  }
  return cacheClient
}

// ========== COMMON KEY PATTERNS ==========

export const CACHE_KEYS = {
  session: (sessionId: string) => `session:${sessionId}`,
  sessionsList: (userId: string) => `sessions:${userId}`,
  eliMemory: (userId: string) => `memory:${userId}`,
  canvasUndo: (sessionId: string) => `undo:${sessionId}`,
  canvasRedo: (sessionId: string) => `redo:${sessionId}`,
}

// ========== DEFAULT EXPIRY TIMES ==========

export const CACHE_TTL = {
  session: 7 * 24 * 60 * 60, // 7 days
  canvasUndo: 1 * 60 * 60, // 1 hour
  memory: 24 * 60 * 60, // 1 day
}
