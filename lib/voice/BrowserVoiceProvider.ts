/**
 * Browser Voice Provider - MVP using SpeechSynthesis API
 *
 * Später ersetzbar durch:
 * - OpenAIVoiceProvider
 * - GoogleVoiceProvider
 * - etc.
 */

import { VoiceProvider, SpeechOptions } from "./types"

export class BrowserVoiceProvider implements VoiceProvider {
  private synth = typeof window !== "undefined" ? window.speechSynthesis : null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeakingState = false

  isAvailable(): boolean {
    return !!this.synth
  }

  async speak(options: SpeechOptions): Promise<void> {
    if (!this.synth) {
      console.warn("[Voice] SpeechSynthesis nicht verfügbar")
      return
    }

    // Stop existierende Sprachausgabe
    this.stop()

    const {
      text,
      priority = 5,
      voiceType = "eli",
      speed = 0.95,
      volume = 0.8,
    } = options

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "de-DE"
      utterance.rate = speed
      utterance.volume = volume
      utterance.pitch = voiceType === "eli" ? 1.2 : 1.0

      utterance.onstart = () => {
        this.isSpeakingState = true
        console.log("[Voice] Start:", text.substring(0, 50))
      }

      utterance.onend = () => {
        this.isSpeakingState = false
        this.currentUtterance = null
        console.log("[Voice] End")
      }

      utterance.onerror = (event) => {
        console.error("[Voice Error]", event.error)
        this.isSpeakingState = false
        this.currentUtterance = null
      }

      this.currentUtterance = utterance
      this.synth.speak(utterance)
    } catch (error) {
      console.error("[Voice] Fehler beim Sprechen:", error)
      this.isSpeakingState = false
    }
  }

  stop(): void {
    if (!this.synth) return
    this.synth.cancel()
    this.isSpeakingState = false
    this.currentUtterance = null
  }

  pause(): void {
    if (!this.synth) return
    this.synth.pause()
  }

  resume(): void {
    if (!this.synth) return
    this.synth.resume()
  }

  isSpeaking(): boolean {
    return this.isSpeakingState || (this.synth?.speaking ?? false)
  }

  dispose(): void {
    this.stop()
    this.currentUtterance = null
  }
}
