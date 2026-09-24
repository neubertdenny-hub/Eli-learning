"use client"

import React, { useState } from "react"
import { EliSpeaking } from "./EliRobot"

interface EliCustomizerProps {
  headColor?: string
  accessory?: string | null
  background?: string | null
  onEquip?: (category: string, itemSlug: string) => void
}

const COLORS = [
  { slug: "eli-blue", name: "Blau", emoji: "🔵" },
  { slug: "eli-purple", name: "Lila", emoji: "🟣" },
  { slug: "eli-green", name: "Grün", emoji: "🟢" },
  { slug: "eli-pink", name: "Pink", emoji: "🩷" },
]

const ACCESSORIES = [
  { slug: "cap", name: "Cap", emoji: "🧢" },
  { slug: "glasses", name: "Brille", emoji: "🕶️" },
  { slug: "headphones", name: "Kopfhörer", emoji: "🎧" },
  { slug: "antenna", name: "Antenne", emoji: "📡" },
]

const BACKGROUNDS = [
  { slug: "space", name: "Weltraum", emoji: "🚀" },
  { slug: "ocean", name: "Ozean", emoji: "🌊" },
  { slug: "forest", name: "Wald", emoji: "🌲" },
]

export function EliCustomizer({
  headColor = "eli-blue",
  accessory = null,
  background = null,
  onEquip,
}: EliCustomizerProps) {
  const [selectedTab, setSelectedTab] = useState<"color" | "accessory" | "background">(
    "color"
  )

  const getMoodByColor = (color: string): "happy" | "excited" | "thinking" => {
    const moods: Record<string, "happy" | "excited" | "thinking"> = {
      "eli-blue": "happy",
      "eli-purple": "excited",
      "eli-green": "happy",
      "eli-pink": "thinking",
    }
    return moods[color] || "happy"
  }

  const getBackgroundGradient = (bg: string | null): string => {
    switch (bg) {
      case "space":
        return "bg-gradient-to-b from-slate-900 via-purple-900 to-slate-800"
      case "ocean":
        return "bg-gradient-to-b from-cyan-300 via-blue-400 to-blue-600"
      case "forest":
        return "bg-gradient-to-b from-green-200 via-emerald-300 to-green-600"
      default:
        return "bg-gradient-to-b from-purple-200 via-pink-100 to-blue-100"
    }
  }

  return (
    <div className="space-y-8">
      {/* Eli Preview */}
      <div
        className={`rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] transition-all duration-500 ${getBackgroundGradient(
          background
        )}`}
      >
        <div className="text-center space-y-4">
          <EliSpeaking
            mood={getMoodByColor(headColor)}
            size="lg"
            message="Schau mich an! 🤩"
          />
          <p className="text-white text-sm font-bold opacity-90">
            {accessory && `Mit ${ACCESSORIES.find(a => a.slug === accessory)?.name}`}
            {background &&
              accessory &&
              ` im ${BACKGROUNDS.find(b => b.slug === background)?.name}`}
            {background && !accessory && `Im ${BACKGROUNDS.find(b => b.slug === background)?.name}`}
          </p>
        </div>
      </div>

      {/* Customization Tabs */}
      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="flex gap-3 border-b-2 border-gray-200 pb-4">
          {(["color", "accessory", "background"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                selectedTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab === "color" && "🎨 Farben"}
              {tab === "accessory" && "👒 Zubehör"}
              {tab === "background" && "🌅 Hintergrund"}
            </button>
          ))}
        </div>

        {/* Color Selection */}
        {selectedTab === "color" && (
          <div className="grid grid-cols-2 gap-3">
            {COLORS.map((color) => (
              <button
                key={color.slug}
                onClick={() => onEquip?.("color", color.slug)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  headColor === color.slug
                    ? "bg-purple-500 text-white ring-4 ring-purple-300"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="text-3xl mb-1">{color.emoji}</div>
                <div className="text-sm">{color.name}</div>
                {headColor === color.slug && <div className="text-xs mt-1">✓ Aktiv</div>}
              </button>
            ))}
          </div>
        )}

        {/* Accessory Selection */}
        {selectedTab === "accessory" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onEquip?.("accessory", "")}
              className={`p-4 rounded-xl font-bold transition-all ${
                !accessory
                  ? "bg-purple-500 text-white ring-4 ring-purple-300"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              <div className="text-3xl mb-1">🚫</div>
              <div className="text-sm">Nichts</div>
              {!accessory && <div className="text-xs mt-1">✓ Aktiv</div>}
            </button>
            {ACCESSORIES.map((acc) => (
              <button
                key={acc.slug}
                onClick={() => onEquip?.("accessory", acc.slug)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  accessory === acc.slug
                    ? "bg-purple-500 text-white ring-4 ring-purple-300"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="text-3xl mb-1">{acc.emoji}</div>
                <div className="text-sm">{acc.name}</div>
                {accessory === acc.slug && <div className="text-xs mt-1">✓ Aktiv</div>}
              </button>
            ))}
          </div>
        )}

        {/* Background Selection */}
        {selectedTab === "background" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onEquip?.("background", "")}
              className={`p-4 rounded-xl font-bold transition-all ${
                !background
                  ? "bg-purple-500 text-white ring-4 ring-purple-300"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              <div className="text-3xl mb-1">☀️</div>
              <div className="text-sm">Standard</div>
              {!background && <div className="text-xs mt-1">✓ Aktiv</div>}
            </button>
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.slug}
                onClick={() => onEquip?.("background", bg.slug)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  background === bg.slug
                    ? "bg-purple-500 text-white ring-4 ring-purple-300"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="text-3xl mb-1">{bg.emoji}</div>
                <div className="text-sm">{bg.name}</div>
                {background === bg.slug && <div className="text-xs mt-1">✓ Aktiv</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
