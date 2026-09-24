"use client"

import React from "react"
import { useVoice } from "@/lib/voice/useVoice"

interface ReadAloudButtonProps {
  text: string
  label?: string
  isMath?: boolean
  speechText?: string
  size?: "sm" | "md" | "lg"
}

export function ReadAloudButton({
  text,
  label = "vorlesen",
  isMath = false,
  speechText,
  size = "md",
}: ReadAloudButtonProps) {
  const { speak, speakMath, stop, isSpeaking } = useVoice()

  const handleClick = async () => {
    if (isSpeaking) {
      stop()
    } else {
      if (isMath) {
        await speakMath(text, speechText)
      } else {
        await speak(text, "explanation")
      }
    }
  }

  const sizeClass = size === "sm" ? "px-2 py-1 text-sm" :
                   size === "md" ? "px-3 py-2 text-base" :
                   "px-4 py-3 text-lg"

  return (
    <button
      onClick={handleClick}
      className={`${sizeClass} rounded-lg font-bold transition-all flex items-center gap-2 ${
        isSpeaking
          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
          : "bg-blue-500 hover:bg-blue-600 text-white"
      }`}
      aria-label={`${isSpeaking ? "Vorlesen stoppen" : "Text vorlesen"}: ${label}`}
      title={isSpeaking ? "Stoppen" : "Vorlesen"}
    >
      <span>{isSpeaking ? "⏹" : "🔊"}</span>
      {size !== "sm" && <span>{isSpeaking ? "Stopp" : label}</span>}
    </button>
  )
}
