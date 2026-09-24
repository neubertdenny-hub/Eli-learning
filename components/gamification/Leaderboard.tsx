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
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-3 justify-center">
        {(["weekly", "monthly", "all-time"] as LeaderboardPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              period === p
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {p === "weekly"
              ? "📅 Diese Woche"
              : p === "monthly"
                ? "📊 Dieser Monat"
                : "🏆 Gesamt"}
          </button>
        ))}
      </div>

      {/* User's Position */}
      {userEntry && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold opacity-90">DEINE POSITION</p>
              <p className="text-3xl font-bold">#{userEntry.rank}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold">{userEntry.userName}</p>
              <p className="text-2xl">Level {userEntry.level}</p>
              <p className="text-sm opacity-90">{userEntry.totalXp} XP</p>
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
              className={`rounded-xl p-4 border-2 transition-all ${
                isCurrentUser
                  ? "bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-200"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Rank */}
                <div className="text-2xl font-bold w-12 text-center">
                  {getMedalEmoji(entry.rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 ml-4">
                  <p className="font-bold text-gray-900">{entry.userName}</p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Level {entry.level}</span>
                    <span>🔥 {entry.streak} Tage</span>
                    <span>🏆 {entry.badges} Badges</span>
                  </div>
                </div>

                {/* XP & Coins */}
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{entry.totalXp} XP</p>
                  <p className="text-sm text-yellow-600 font-bold">
                    {entry.totalCoins} 🪙
                  </p>
                </div>
              </div>

              {/* Progress Bar (if current user) */}
              {isCurrentUser && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-2">
                    Fortschritt zum nächsten Level
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all"
                      style={{ width: "42%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {entry.totalXp} / 7800 XP (noch 1275 XP)
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        🎯 Rankings aktualisieren sich stündlich basierend auf XP, Level und Streaks
      </p>
    </div>
  )
}
