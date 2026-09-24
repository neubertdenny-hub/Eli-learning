"use client"

import React, { useState, useEffect } from "react"
import type { LeaderboardData, LeaderboardPeriod } from "@/lib/gamification/leaderboard"

interface LeaderboardProps {
  userId: string
}

export function Leaderboard({ userId }: LeaderboardProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all-time")
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/leaderboard?userId=${userId}&period=${period}`)
        const data = await res.json()

        if (data.success) {
          setLeaderboard(data.leaderboard)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [userId, period])

  if (loading || !leaderboard) {
    return <div className="text-center text-gray-600">Leaderboard lädt...</div>
  }

  const userEntry = leaderboard.userEntry

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 sm:gap-3 justify-center overflow-x-auto pb-2">
        {(["weekly", "monthly", "all-time"] as LeaderboardPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 sm:px-6 py-2 sm:py-2 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all whitespace-nowrap h-10 sm:h-auto ${
              period === p
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {p === "weekly"
              ? "📅 Woche"
              : p === "monthly"
                ? "📊 Monat"
                : "🏆 Gesamt"}
          </button>
        ))}
      </div>

      {/* User's Position */}
      {userEntry && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center gap-4">
            <div>
              <p className="text-xs sm:text-sm font-bold opacity-90">POSITION</p>
              <p className="text-2xl sm:text-3xl font-bold">#{userEntry.rank}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs sm:text-base font-bold truncate">{userEntry.userName}</p>
              <p className="text-lg sm:text-2xl">Level {userEntry.level}</p>
              <p className="text-xs sm:text-sm opacity-90">{userEntry.totalXp} XP</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="space-y-2">
        {leaderboard.entries.map((entry, idx) => {
          const isCurrentUser = entry.userId === userId
          const getMedalEmoji = (rank: number) => {
            switch (rank) {
              case 1:
                return "🥇"
              case 2:
                return "🥈"
              case 3:
                return "🥉"
              default:
                return `#${rank}`
            }
          }

          return (
            <div
              key={entry.userId}
              className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 transition-all ${
                isCurrentUser
                  ? "bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-200"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Rank */}
                <div className="text-xl sm:text-2xl font-bold w-8 sm:w-12 text-center flex-shrink-0">
                  {getMedalEmoji(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{entry.userName}</p>
                  <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                    <span className="whitespace-nowrap">Lv {entry.level}</span>
                    <span className="whitespace-nowrap">🔥 {entry.streak}</span>
                    <span className="whitespace-nowrap">🏆 {entry.badges}</span>
                  </div>
                </div>

                {/* XP & Coins */}
                <div className="text-right flex-shrink-0">
                  <p className="text-base sm:text-lg font-bold text-blue-600">{entry.totalXp}</p>
                  <p className="text-xs sm:text-sm text-yellow-600 font-bold">
                    {entry.totalCoins}🪙
                  </p>
                </div>
              </div>

              {/* Progress Bar (if current user) */}
              {isCurrentUser && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-1 sm:mb-2">
                    → Nächstes Level
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all"
                      style={{ width: "42%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {entry.totalXp} / 7800 XP
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center px-2">
        🎯 Rankings aktualisieren sich stündlich
      </p>
    </div>
  )
}
