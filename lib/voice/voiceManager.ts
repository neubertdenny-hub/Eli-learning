/**
 * Voice Manager - zentrale Verwaltung
 *
 * - Voice Provider Abstraktion
 * - Settings persistent
 * - Event Priority System
 * - Cooldown für Auto-Speak
 */

import { BrowserVoiceProvider } from "./BrowserVoiceProvider"
import { VoiceProvider, VoiceSettings, VoiceEventType } from "./types"
import { shouldAutoSpeak } from "./mathToSpeech"

const VOICE_SETTINGS_KEY = "eli-voice-settings"
const DEFAULT_SETTINGS: VoiceSettings = {
  autoVoiceEnabled: true,
  autoReadTasksEnabled: false,
  voiceSpeed: 0.95,
  voiceVolume: 0.8,
  language: "de-DE",
}

const VOICE_COOLDOWN_MS = 2000 // Mindestens 2 Sekunden zwischen Äußerungen

export class VoiceManager {
  private provider: VoiceProvider
  private settings: VoiceSettings
  private lastAutoSpeakTime = 0
  private pendingEvents: Array<{ text: string; type: VoiceEventType }> = []

  constructor() {
    this.provider = new BrowserVoiceProvider()
    this.settings = this.loadSettings()
  }

  private loadSettings(): VoiceSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS

    try {
      const stored = localStorage.getItem(VOICE_SETTINGS_KEY)
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error("[Voice] Fehler beim Laden der Settings:", error)
    }

    return DEFAULT_SETTINGS
  }

  private saveSettings(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(this.settings))
    } catch (error) {
      console.error("[Voice] Fehler beim Speichern der Settings:", error)
    }
  }

  async speak(
    text: string,
    eventType: VoiceEventType = "explanation",
    isAutomatic = false
  ): Promise<void> {
    if (!this.provider.isAvailable()) return

    const shouldAuto = isAutomatic && this.settings.autoVoiceEnabled && shouldAutoSpeak(eventType)

    if (shouldAuto) {
      const now = Date.now()
      if (now - this.lastAutoSpeakTime < VOICE_COOLDOWN_MS) {
        // Queue statt sofort sprechen
        this.pendingEvents.push({ text, type: eventType })
        return
      }
      this.lastAutoSpeakTime = now
    }

    await this.provider.speak({
      text,
      priority: this.getPriority(eventType),
      voiceType: "eli",
      speed: this.settings.voiceSpeed,
      volume: this.settings.voiceVolume,
    })
  }

  async speakMath(
    mathExpression: string,
    speechText?: string
  ): Promise<void> {
    if (!this.provider.isAvailable()) return

    // Verwende optional bereitgestellten Text oder konvertiere
    const textToSpeak = speechText || this.mathToNaturalLanguage(mathExpression)

    await this.speak(textToSpeak, "math", false)
  }

  private mathToNaturalLanguage(expr: string): string {
    // Vereinfachte Version
    return expr
      .replace(/×/g, "mal")
      .replace(/÷/g, "geteilt durch")
      .replace(/\+/g, "plus")
      .replace(/=/g, "gleich")
      .replace(/,/g, "Komma")
      .replace(/-/, "Minus")
  }

  stop(): void {
    this.provider.stop()
    this.pendingEvents = []
  }

  getSettings(): VoiceSettings {
    return this.settings
  }

  updateSettings(partial: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...partial }
    this.saveSettings()
  }

  toggleAutoVoice(enabled?: boolean): void {
    this.settings.autoVoiceEnabled =
      enabled ?? !this.settings.autoVoiceEnabled
    this.saveSettings()
  }

  toggleAutoReadTasks(enabled?: boolean): void {
    this.settings.autoReadTasksEnabled =
      enabled ?? !this.settings.autoReadTasksEnabled
    this.saveSettings()
  }

  setVoiceSpeed(speed: number): void {
    this.settings.voiceSpeed = Math.max(0.5, Math.min(2.0, speed))
    this.saveSettings()
  }

  isSpeaking(): boolean {
    return this.provider.isSpeaking()
  }

  isAutoVoiceEnabled(): boolean {
    return this.settings.autoVoiceEnabled
  }

  private getPriority(eventType: VoiceEventType): number {
    const priorities: Record<VoiceEventType, number> = {
      mission_completed: 10,
      level_up: 9,
      badge_unlock: 8,
      foundation_gap: 7,
      self_correction: 6,
      motivation: 5,
      greeting: 4,
      task_correct_independent: 3,
      task_correct_with_help: 2,
      explanation: 1,
      math: 1,
      hint: 1,
    }
    return priorities[eventType] ?? 1
  }

  dispose(): void {
    this.provider.dispose()
  }
}

// Singleton
let voiceManagerInstance: VoiceManager | null = null

export function getVoiceManager(): VoiceManager {
  if (!voiceManagerInstance) {
    voiceManagerInstance = new VoiceManager()
  }
  return voiceManagerInstance
}
