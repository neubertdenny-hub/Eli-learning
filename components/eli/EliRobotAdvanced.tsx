"use client"

import React from "react"

interface EliRobotAdvancedProps {
  headColor?: string
  accessory?: string | null
  background?: string | null
  outfit?: string | null
  shoes?: string | null
  message?: string
  size?: "sm" | "md" | "lg"
}

const COLOR_MAP: Record<string, { head: string; body: string }> = {
  "eli-blue": { head: "#3B82F6", body: "#1E40AF" },
  "eli-purple": { head: "#A855F7", body: "#7E22CE" },
  "eli-green": { head: "#10B981", body: "#047857" },
  "eli-pink": { head: "#EC4899", body: "#BE185D" },
}

export function EliRobotAdvanced({
  headColor = "eli-blue",
  accessory = null,
  background = null,
  outfit = null,
  shoes = null,
  message = "Hallo!",
  size = "lg",
}: EliRobotAdvancedProps) {
  const colors = COLOR_MAP[headColor] || COLOR_MAP["eli-blue"]
  const sizeClass = size === "sm" ? "w-24 h-24" : size === "md" ? "w-32 h-32" : "w-48 h-48"

  const getOutfitColor = (outfitSlug: string | null): string => {
    if (!outfitSlug) return "none"
    const map: Record<string, string> = {
      "shirt-red": "#DC2626",
      "shirt-blue": "#0EA5E9",
      "shirt-purple": "#A855F7",
      "hoodie-black": "#1F2937",
      "hoodie-gray": "#6B7280",
      "jacket-leather": "#92400E",
    }
    return map[outfitSlug] || "#6B7280"
  }

  const getShoesColor = (shoesSlug: string | null): string => {
    if (!shoesSlug) return "none"
    const map: Record<string, string> = {
      "shoes-black": "#1F2937",
      "shoes-red": "#DC2626",
      "shoes-sneaker": "#FFFFFF",
      "shoes-boots": "#92400E",
    }
    return map[shoesSlug] || "#1F2937"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Robot */}
      <svg
        viewBox="0 0 200 280"
        className={`${sizeClass} drop-shadow-lg`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <rect x="60" y="100" width="80" height="100" rx="8" fill={colors.body} />

        {/* Outfit/Shirt */}
        {outfit && (
          <rect
            x="62"
            y="105"
            width="76"
            height="70"
            rx="6"
            fill={getOutfitColor(outfit)}
            opacity="0.9"
          />
        )}

        {/* Chest Panel */}
        <rect x="80" y="110" width="40" height="50" rx="4" fill="#333333" opacity="0.3" />

        {/* Arms */}
        <rect x="30" y="120" width="30" height="60" rx="6" fill={colors.body} />
        <rect x="140" y="120" width="30" height="60" rx="6" fill={colors.body} />

        {/* Hand 1 */}
        <circle cx="30" cy="185" r="8" fill={colors.head} />

        {/* Hand 2 */}
        <circle cx="170" cy="185" r="8" fill={colors.head} />

        {/* Legs */}
        <rect x="75" y="205" width="20" height="50" rx="4" fill={colors.body} />
        <rect x="105" y="205" width="20" height="50" rx="4" fill={colors.body} />

        {/* Shoes */}
        {shoes && (
          <>
            <ellipse
              cx="85"
              cy="260"
              rx="12"
              ry="8"
              fill={getShoesColor(shoes)}
            />
            <ellipse
              cx="115"
              cy="260"
              rx="12"
              ry="8"
              fill={getShoesColor(shoes)}
            />
          </>
        )}

        {/* Head */}
        <circle cx="100" cy="60" r="35" fill={colors.head} />

        {/* Antenna/Accessories */}
        {accessory === "antenna" && (
          <>
            <line x1="100" y1="20" x2="100" y2="-10" stroke="#FFD700" strokeWidth="3" />
            <circle cx="100" cy="-10" r="4" fill="#FFD700" />
          </>
        )}

        {/* Hat/Cap */}
        {accessory === "cap" && (
          <>
            <path
              d="M 70 30 Q 100 15 130 30 L 125 35 Q 100 22 75 35 Z"
              fill="#DC2626"
            />
            <path d="M 75 35 L 125 35 L 120 40 L 80 40 Z" fill="#991B1B" />
          </>
        )}

        {/* Glasses/Brille */}
        {accessory === "glasses" && (
          <>
            <rect
              x="70"
              y="45"
              width="15"
              height="12"
              rx="2"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            />
            <rect
              x="115"
              y="45"
              width="15"
              height="12"
              rx="2"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
            />
            <line
              x1="85"
              y1="51"
              x2="115"
              y2="51"
              stroke="#000000"
              strokeWidth="2"
            />
          </>
        )}

        {/* Headphones */}
        {accessory === "headphones" && (
          <>
            <path
              d="M 70 40 Q 70 20 100 20 Q 130 20 130 40"
              fill="none"
              stroke="#000000"
              strokeWidth="3"
            />
            <circle cx="72" cy="55" r="8" fill="none" stroke="#000000" strokeWidth="2" />
            <circle cx="128" cy="55" r="8" fill="none" stroke="#000000" strokeWidth="2" />
          </>
        )}

        {/* Chain/Kette */}
        {accessory === "chain" && (
          <>
            <g stroke="#FFD700" strokeWidth="2" fill="none">
              <circle cx="85" cy="140" r="3" />
              <circle cx="92" cy="145" r="3" />
              <circle cx="99" cy="148" r="3" />
              <circle cx="106" cy="145" r="3" />
              <circle cx="113" cy="140" r="3" />
              <circle cx="120" cy="135" r="3" />
              <line x1="85" y1="140" x2="92" y2="145" />
              <line x1="92" y1="145" x2="99" y2="148" />
              <line x1="99" y1="148" x2="106" y2="145" />
              <line x1="106" y1="145" x2="113" y2="140" />
              <line x1="113" y1="140" x2="120" y2="135" />
            </g>
          </>
        )}

        {/* Eyes */}
        <circle cx="85" cy="55" r="4" fill="#000000" />
        <circle cx="115" cy="55" r="4" fill="#000000" />

        {/* Smile */}
        <path
          d="M 90 70 Q 100 78 110 70"
          fill="none"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Message Bubble */}
      {message && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-6 py-2 text-center text-sm font-bold max-w-xs">
          {message}
        </div>
      )}
    </div>
  )
}
