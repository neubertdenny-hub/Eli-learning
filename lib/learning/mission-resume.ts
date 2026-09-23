/**
 * Mission Resume Manager
 *
 * Speichert Missions-State wenn App geschlossen wird
 * Erlaubt fortsetzen statt neustart
 */

export interface SavedMissionState {
  missionId: string
  userId: string
  date: string
  status: "paused" | "in_progress"
  currentBlockIndex: number
  completedBlocks: number
  totalBlocks: number
  usedSeconds: number
  targetSeconds: number
  xpEarned: number
  blocks: any[]
  metrics: any
  adjustments: any[]
  lastSavedAt: string
  canResume: boolean // Noch gültig?
}

export class MissionResumeManager {
  private storageKey = "eli_mission_state"
  private maxStaleHours = 24

  /**
   * Speichere aktuellen Mission State
   */
  saveMissionState(state: SavedMissionState): boolean {
    try {
      const stateWithTimestamp = {
        ...state,
        lastSavedAt: new Date().toISOString(),
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(stateWithTimestamp))
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to save mission state:", error)
      return false
    }
  }

  /**
   * Lade gespeicherten Mission State
   */
  loadMissionState(): SavedMissionState | null {
    try {
      if (typeof localStorage === "undefined") return null

      const saved = localStorage.getItem(this.storageKey)
      if (!saved) return null

      const state: SavedMissionState = JSON.parse(saved)

      // Prüfe ob noch gültig (nicht älter als 24 Stunden)
      const lastSaved = new Date(state.lastSavedAt)
      const hoursPassed = (new Date().getTime() - lastSaved.getTime()) / (1000 * 60 * 60)

      state.canResume = hoursPassed <= this.maxStaleHours

      return state
    } catch (error) {
      console.error("Failed to load mission state:", error)
      return null
    }
  }

  /**
   * Prüfe ob Mission resumierbar ist
   */
  canResume(): boolean {
    const state = this.loadMissionState()
    return state?.canResume ?? false
  }

  /**
   * Lösche gespeicherte Mission (nach erfolgreicher Beendigung)
   */
  clearMissionState(): boolean {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(this.storageKey)
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to clear mission state:", error)
      return false
    }
  }

  /**
   * Gebe Resume Summary für UI
   */
  getResumeSummary(): {
    missionName: string
    progress: string
    timeUsed: string
    xpEarned: number
    lastSaved: string
  } | null {
    const state = this.loadMissionState()
    if (!state || !state.canResume) return null

    const lastSaved = new Date(state.lastSavedAt)
    const minutesUsed = Math.floor(state.usedSeconds / 60)
    const minutesTotal = Math.floor(state.targetSeconds / 60)

    return {
      missionName: state.missionId,
      progress: `${state.completedBlocks} von ${state.totalBlocks} Blöcken`,
      timeUsed: `${minutesUsed}/${minutesTotal} Minuten`,
      xpEarned: state.xpEarned,
      lastSaved: this.formatTime(lastSaved),
    }
  }

  /**
   * Formatiere Zeit für Display
   */
  private formatTime(date: Date): string {
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diff < 1) return "gerade eben"
    if (diff < 60) return `vor ${Math.floor(diff)} Minuten`
    if (diff < 1440) return `vor ${Math.floor(diff / 60)} Stunden`
    return `vor ${Math.floor(diff / 1440)} Tagen`
  }

  /**
   * Exportiere Mission State für Server (falls DB Support später)
   */
  exportForDatabase(): string {
    const state = this.loadMissionState()
    if (!state) return ""
    return JSON.stringify(state, null, 2)
  }

  /**
   * Importiere Mission State von Server
   */
  importFromDatabase(jsonString: string): boolean {
    try {
      const state = JSON.parse(jsonString) as SavedMissionState
      return this.saveMissionState(state)
    } catch (error) {
      console.error("Failed to import mission state:", error)
      return false
    }
  }

  /**
   * Validiere Mission State
   */
  isValidState(state: SavedMissionState): boolean {
    return (
      !!state.missionId &&
      !!state.userId &&
      state.currentBlockIndex >= 0 &&
      state.completedBlocks >= 0 &&
      state.totalBlocks > 0 &&
      state.usedSeconds >= 0 &&
      state.targetSeconds > 0
    )
  }
}

/**
 * React Hook für Mission Resume
 */
export function useMissionResume() {
  const manager = new MissionResumeManager()

  return {
    canResume: manager.canResume(),
    summary: manager.getResumeSummary(),
    resume: () => manager.loadMissionState(),
    save: (state: SavedMissionState) => manager.saveMissionState(state),
    clear: () => manager.clearMissionState(),
  }
}
