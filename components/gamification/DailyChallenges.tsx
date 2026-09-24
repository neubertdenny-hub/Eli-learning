"use client"

import React, { useEffect, useState } from "react"
import type { Challenge } from "@/lib/gamification/daily-challenges"

interface ChallengeWithProgress extends Challenge {
  progress: number
  completed: boolean
  rewardsClaimed: boolean
}

interface DailyChallengesProps {
  userId: string
}

export function DailyChallenges({ userId }: DailyChallengesProps) {
  const [challenges, setChallenges] = useState<ChallengeWithProgress[]>([])
  const [bonusRewards, setBonusRewards] = useState({ xp: 0, coins: 0 })
  const [claimedCount, setClaimedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch(`/api/challenges/daily?userId=${userId}`)
        const data = await res.json()

        if (data.success) {
          setChallenges(data.challenges)
          setBonusRewards(data.bonusRewards)
          setClaimedCount(data.claimedCount)
        }
      } catch (error) {
        console.error("Error fetching challenges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [userId])

  if (loading) {
    return <div className="text-center text-gray-600">Challenges laden...</div>
  }

  return (
    <div className="space-y-4">
      {/* Bonus Rewards Summary */}
      {bonusRewards.xp > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <p className="text-sm font-bold mb-1">🎁 Tages-Bonus verfügbar</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">+{bonusRewards.xp} XP</p>
              <p className="text-sm opacity-90">+{bonusRewards.coins} Coins</p>
            </div>
            <p className="text-3xl">{claimedCount}/3 erledigt</p>
          </div>
        </div>
      )}

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 gap-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`rounded-xl p-4 border-2 transition-all ${
              challenge.completed
                ? "bg-green-50 border-green-300"
                : "bg-white border-blue-200 hover:border-blue-400"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {challenge.icon} {challenge.title}
                </p>
                <p className="text-sm text-gray-600">{challenge.description}</p>
              </div>
              {challenge.completed ? (
                <span className="text-2xl">✅</span>
              ) : (
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  challenge.difficulty === "einfach" ? "bg-green-100 text-green-700" :
                  challenge.difficulty === "mittel" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {challenge.difficulty}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-700">
                  Fortschritt: {challenge.progress}/{challenge.target}
                </span>
                <span className="text-gray-600">
                  {Math.round((challenge.progress / challenge.target) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    challenge.completed
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gradient-to-r from-blue-400 to-blue-500"
                  }`}
                  style={{
                    width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Reward Badge */}
            {challenge.completed && (
              <div className="mt-3 flex justify-between items-center bg-green-100 rounded-lg p-2">
                <p className="text-sm font-bold text-green-700">Bonus freigegeben!</p>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-700">
                    +{challenge.reward.xp} XP · +{challenge.reward.coins} 🪙
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        🔄 Challenges resetten täglich um Mitternacht
      </p>
    </div>
  )
}
