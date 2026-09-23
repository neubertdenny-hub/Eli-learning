/**
 * App Header Component
 *
 * Shows user info (Zoey), current level, XP, and optional streak.
 * Compact and mobile-friendly.
 */

import React from "react"
import Link from "next/link"

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
    <header className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white sticky top-0 z-50 shadow-lg safe-area-inset-top">
      <div className="container-full py-4 sm:py-5">
        {/* Top Row: User + Parent - More spacious */}
        <div className="flex items-center justify-between mb-4">
          {/* User Name - Bigger */}
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl font-bold">👋 {userName}</div>
            <div className="text-sm opacity-90">Level {currentLevel}</div>
          </div>

          {/* Parent Access - Better styled */}
          {showParentAccess && (
            <Link
              href="/parent"
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-sm font-medium backdrop-blur-sm flex items-center gap-2"
              aria-label="Elternansicht"
              title="Parent Dashboard"
            >
              <span className="text-lg">👨‍👩‍👧</span>
              <span className="hidden sm:inline">Eltern</span>
            </Link>
          )}
        </div>

        {/* Stats Row: Level + Streak - Horizontal, modern */}
        <div className="flex gap-3 sm:gap-4 mb-4">
          {/* Level Card */}
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-xs opacity-75 font-medium">🏆 LEVEL</div>
            <div className="text-2xl sm:text-3xl font-bold">{currentLevel}</div>
          </div>

          {/* XP Progress */}
          <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-xs opacity-75 font-medium">⭐ PUNKTE</div>
            <div className="text-2xl sm:text-3xl font-bold">{currentXP}</div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xs opacity-75 font-medium">🔥 STREAK</div>
              <div className="text-2xl sm:text-3xl font-bold">{streak}</div>
            </div>
          )}
        </div>

        {/* XP Progress Bar - Full width */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold opacity-90">Fortschritt</span>
            <span className="text-xs opacity-75">
              {xpPercentage}% → Level {currentLevel + 1}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-white/10">
            <div
              className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
