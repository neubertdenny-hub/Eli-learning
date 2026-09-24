/**
 * React Hook for Voice Management
 *
 * Gibt allen Komponenten einfachen Zugriff auf Voice-Funktionen
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import { getVoiceManager } from "./voiceManager"
import type { VoiceSettings, VoiceEventType } from "./types"

export function useVoice() {
  const manager = getVoiceManager()
  const [settings, setSettings] = useState<VoiceSettings>(manager.getSettings())
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    const checkSpeaking = setInterval(() => {
      setIsSpeaking(manager.isSpeaking())
    }, 100)

    return () => clearInterval(checkSpeaking)
  }, [manager])

  const speak = useCallback(
    async (text: string, eventType: VoiceEventType = "explanation") => {
      await manager.speak(text, eventType, false)
    },
    [manager]
  )

  const autoSpeak = useCallback(
    async (text: string, eventType: VoiceEventType = "greeting") => {
      await manager.speak(text, eventType, true)
    },
    [manager]
  )

  const speakMath = useCallback(
    async (mathExpr: string, speechText?: string) => {
      await manager.speakMath(mathExpr, speechText)
    },
    [manager]
  )

  const stop = useCallback(() => {
    manager.stop()
    setIsSpeaking(false)
  }, [manager])

  const toggleAutoVoice = useCallback((enabled?: boolean) => {
    manager.toggleAutoVoice(enabled)
    setSettings(manager.getSettings())
  }, [manager])

  const toggleAutoRead = useCallback((enabled?: boolean) => {
    manager.toggleAutoReadTasks(enabled)
    setSettings(manager.getSettings())
  }, [manager])

  const setVoiceSpeed = useCallback((speed: number) => {
    manager.setVoiceSpeed(speed)
    setSettings(manager.getSettings())
  }, [manager])

  return {
    speak,
    autoSpeak,
    speakMath,
    stop,
    isSpeaking,
    settings,
    toggleAutoVoice,
    toggleAutoRead,
    setVoiceSpeed,
    isAutoVoiceEnabled: settings.autoVoiceEnabled,
  }
}
