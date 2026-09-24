/**
 * Voice System Types & Interfaces
 *
 * Abstraktion für Sprachausgabe:
 * - Browser SpeechSynthesis (MVP)
 * - später: OpenAI Voice, etc.
 */

export type VoiceEventType =
  | "greeting"
  | "task_correct_independent"
  | "task_correct_with_help"
  | "self_correction"
  | "foundation_gap"
  | "level_up"
  | "badge_unlock"
  | "mission_completed"
  | "motivation"
  | "explanation"
  | "math"
  | "hint"

export interface VoiceSettings {
  autoVoiceEnabled: boolean
  autoReadTasksEnabled: boolean
  voiceSpeed: number // 0.5 - 2.0
  voiceVolume: number // 0 - 1
  language: string // de-DE
}

export interface SpeechOptions {
  text: string
  priority?: number // 1-10, höher = wichtiger
  voiceType?: "eli" | "narrator"
  speed?: number
  volume?: number
}

export interface VoiceProvider {
  speak(options: SpeechOptions): Promise<void>
  stop(): void
  pause(): void
  resume(): void
  isSpeaking(): boolean
  isAvailable(): boolean
  dispose(): void
}

export interface MathSpeechConfig {
  enableAutoConversion: boolean
  useSpelledOutNumbers: boolean // "drei" statt "3"
  fractionReadingStyle: "fraction" | "decimal" // "drei Viertel" vs "null Komma siebfünf"
}
