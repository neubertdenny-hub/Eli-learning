"use client"

import React, { useState } from "react"
import { EliRobotAdvanced } from "./EliRobotAdvanced"

interface EliCustomizerProps {
  headColor?: string
  accessory?: string | null
  background?: string | null
  outfit?: string | null
  shoes?: string | null
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
  outfit = null,
  shoes = null,
  onEquip,
}: EliCustomizerProps) {
  const [selectedTab, setSelectedTab] = useState<"color" | "accessory" | "background" | "outfit" | "shoes">(
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
          <EliRobotAdvanced
            headColor={headColor}
            accessory={accessory}
            background={background}
            outfit={outfit}
            shoes={shoes}
            message="Schau mich an! 🤩"
            size="lg"
          />
        </div>
      </div>

      {/* Customization Tabs */}
      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="flex gap-2 border-b-2 border-gray-200 pb-4 overflow-x-auto">
          {(["color", "accessory", "outfit", "shoes", "background"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedTab === tab
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab === "color" && "🎨 Farben"}
              {tab === "accessory" && "👒 Zubehör"}
              {tab === "outfit" && "👕 Kleidung"}
              {tab === "shoes" && "👟 Schuhe"}
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

        {/* Outfit Selection */}
        {selectedTab === "outfit" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onEquip?.("outfit", "")}
              className={`p-4 rounded-xl font-bold transition-all ${
                !outfit
                  ? "bg-purple-500 text-white ring-4 ring-purple-300"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              <div className="text-3xl mb-1">👕</div>
              <div className="text-sm">Nichts</div>
              {!outfit && <div className="text-xs mt-1">✓ Aktiv</div>}
            </button>
            {[
              { slug: "shirt-red", name: "Rotes Shirt", emoji: "🔴" },
              { slug: "shirt-blue", name: "Blaues Shirt", emoji: "🔵" },
              { slug: "shirt-purple", name: "Violettes Shirt", emoji: "🟣" },
              { slug: "hoodie-black", name: "Schwarzer Hoodie", emoji: "🖤" },
              { slug: "hoodie-gray", name: "Grauer Hoodie", emoji: "🩶" },
              { slug: "jacket-leather", name: "Lederjacke", emoji: "🤎" },
            ].map((out) => (
              <button
                key={out.slug}
                onClick={() => onEquip?.("outfit", out.slug)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  outfit === out.slug
                    ? "bg-purple-500 text-white ring-4 ring-purple-300"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="text-3xl mb-1">{out.emoji}</div>
                <div className="text-sm">{out.name}</div>
                {outfit === out.slug && <div className="text-xs mt-1">✓ Aktiv</div>}
              </button>
            ))}
          </div>
        )}

        {/* Shoes Selection */}
        {selectedTab === "shoes" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onEquip?.("shoes", "")}
              className={`p-4 rounded-xl font-bold transition-all ${
                !shoes
                  ? "bg-purple-500 text-white ring-4 ring-purple-300"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              <div className="text-3xl mb-1">🦶</div>
              <div className="text-sm">Barfuß</div>
              {!shoes && <div className="text-xs mt-1">✓ Aktiv</div>}
            </button>
            {[
              { slug: "shoes-black", name: "Schwarze Schuhe", emoji: "🖤" },
              { slug: "shoes-red", name: "Rote Schuhe", emoji: "❤️" },
              { slug: "shoes-sneaker", name: "Weiße Sneaker", emoji: "⚪" },
              { slug: "shoes-boots", name: "Boots", emoji: "🟤" },
            ].map((shoe) => (
              <button
                key={shoe.slug}
                onClick={() => onEquip?.("shoes", shoe.slug)}
                className={`p-4 rounded-xl font-bold transition-all ${
                  shoes === shoe.slug
                    ? "bg-purple-500 text-white ring-4 ring-purple-300"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                <div className="text-3xl mb-1">{shoe.emoji}</div>
                <div className="text-sm">{shoe.name}</div>
                {shoes === shoe.slug && <div className="text-xs mt-1">✓ Aktiv</div>}
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
