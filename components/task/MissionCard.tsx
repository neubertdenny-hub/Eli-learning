/**
 * Mission Card Component
 *
 * Shows the current/suggested learning mission.
 * Clean, modern design.
 */

import React from "react"
import Link from "next/link"

interface MissionCardProps {
  title: string
  description?: string
  duration?: string // e.g. "ca. 20 Minuten"
  difficulty?: 1 | 2 | 3 | 4 | 5
  onClick?: () => void
  href?: string
  disabled?: boolean
}

const DIFFICULTY_STARS: Record<number, string> = {
  1: "⭐",
  2: "⭐⭐",
  3: "⭐⭐⭐",
  4: "⭐⭐⭐⭐",
  5: "⭐⭐⭐⭐⭐",
}

export function MissionCard({
  title,
  description,
  duration = "ca. 20 Minuten",
  difficulty = 2,
  onClick,
  href,
  disabled = false,
}: MissionCardProps) {
  const content = (
    <div
      className={`w-full p-6 sm:p-8 rounded-2xl border-3 border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer"
      }`}
    >
      {/* Emoji Accent */}
      <div className="text-5xl sm:text-6xl mb-4">🚀</div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>

      {/* Description */}
      {description && <p className="text-base sm:text-lg text-gray-600 mb-4">{description}</p>}

      {/* Duration & Difficulty */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-6">
        <div className="flex items-center gap-2 text-base sm:text-lg font-medium text-gray-700">
          <span>⏱️</span>
          <span>{duration}</span>
        </div>

        <div className="flex items-center gap-2 text-base sm:text-lg font-medium text-gray-700">
          <span>Schwierigkeit:</span>
          <span>{DIFFICULTY_STARS[difficulty]}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3 text-lg sm:text-xl font-bold text-blue-600">
        <span>Los geht's</span>
        <span>→</span>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left"
    >
      {content}
    </button>
  )
}
