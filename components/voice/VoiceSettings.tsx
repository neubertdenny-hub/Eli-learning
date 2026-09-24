"use client"

import React from "react"
import { useVoice } from "@/lib/voice/useVoice"

export function VoiceSettings() {
  const { settings, toggleAutoVoice, toggleAutoRead, setVoiceSpeed } = useVoice()

  return (
    <div className="space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
      <h3 className="text-lg font-bold text-gray-900">🔊 Eli's Stimme</h3>

      {/* Auto Voice */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700">
          Eli spricht automatisch
        </label>
        <button
          onClick={() => toggleAutoVoice()}
          className={`w-12 h-7 rounded-full transition-all ${
            settings.autoVoiceEnabled
              ? "bg-green-500"
              : "bg-gray-300"
          } flex items-center px-1`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.autoVoiceEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Auto Read Tasks */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700">
          Aufgaben automatisch vorlesen
        </label>
        <button
          onClick={() => toggleAutoRead()}
          className={`w-12 h-7 rounded-full transition-all ${
            settings.autoReadTasksEnabled
              ? "bg-green-500"
              : "bg-gray-300"
          } flex items-center px-1`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              settings.autoReadTasksEnabled ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Voice Speed */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">
          Sprachgeschwindigkeit: {(settings.voiceSpeed * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={settings.voiceSpeed}
          onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>langsam</span>
          <span>normal</span>
          <span>schnell</span>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-600 bg-white rounded p-3 border border-blue-100">
        💡 <strong>Tipp:</strong> Klick auf 🔊 um Aufgaben jederzeit vorlesen
        zu lassen!
      </div>
    </div>
  )
}
