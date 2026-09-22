/**
 * App Header Component
 *
 * Shows user info (Zoey), current level, XP, and optional streak.
 * Compact and mobile-friendly.
 */

import React from "react"

interface HeaderProps {
  userName?: string
  currentLevel?: number
  currentXP?: number
  maxXP?: number
  streak?: number
  showParentAccess?: boolean
  onParentClick?: () => void
}

export function Header({
  userName = "Zoey",
  currentLevel = 1,
  currentXP = 0,
  maxXP = 100,
  streak = 0,
  showParentAccess = true,
  onParentClick,
}: HeaderProps) {
  const xpPercentage = Math.round((currentXP / maxXP) * 100)

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white sticky top-0 z-50 shadow-md safe-area-inset-top">
      <div className="container-full py-3 sm:py-4">
        {/* Top Row: User + Parent */}
        <div className="flex items-center justify-between mb-3">
          {/* User Name */}
          <div className="flex items-center gap-2">
            <div className="text-lg sm:text-xl font-bold">👋 {userName}</div>
          </div>

          {/* Parent Access (subtle) */}
          {showParentAccess && (
            <button
              onClick={onParentClick}
              className="text-xs sm:text-sm px-2 py-1 rounded bg-blue-700 hover:bg-blue-800 transition-colors opacity-75 hover:opacity-100"
              aria-label="Elternansicht"
            >
              👨‍👩‍👧
            </button>
          )}
        </div>

        {/* Middle Row: Level + Streak */}
        <div className="flex items-center gap-4 mb-3">
          {/* Level */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-xs opacity-75">Level</div>
              <div className="text-lg sm:text-xl font-bold">{currentLevel}</div>
            </div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-xs opacity-75">Streak</div>
                <div className="text-lg sm:text-xl font-bold">{streak} Tage</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Row: XP Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs sm:text-sm font-medium">⭐ XP</span>
            <span className="text-xs opacity-75">
              {currentXP} / {maxXP}
            </span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <div className="text-xs text-right mt-1 opacity-75">
            {Math.round(((maxXP - currentXP) / maxXP) * 100)}% bis Level {currentLevel + 1}
          </div>
        </div>
      </div>
    </header>
  )
}
