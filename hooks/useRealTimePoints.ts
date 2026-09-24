"use client"

import { useState, useCallback } from "react"

interface PointsUpdate {
  xpEarned: number
  coinsEarned: number
  totalXP: number
  totalCoins: number
}

/**
 * Hook für Live Points Aktualisierung
 * Zeigt XP/Coins Animation wenn Task gelöst
 */
export function useRealTimePoints(initialXP: number = 0, initialCoins: number = 0) {
  const [totalXP, setTotalXP] = useState(initialXP)
  const [totalCoins, setTotalCoins] = useState(initialCoins)
  const [lastUpdate, setLastUpdate] = useState<PointsUpdate | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)

  const addPoints = useCallback((xpEarned: number, coinsEarned: number) => {
    // Update total
    setTotalXP(prev => prev + xpEarned)
    setTotalCoins(prev => prev + coinsEarned)

    // Show animation
    setLastUpdate({
      xpEarned,
      coinsEarned,
      totalXP: totalXP + xpEarned,
      totalCoins: totalCoins + coinsEarned,
    })

    setShowAnimation(true)

    // Hide animation after 2s
    setTimeout(() => setShowAnimation(false), 2000)

    // Persist to localStorage
    try {
      localStorage.setItem(
        "playerPoints",
        JSON.stringify({ xp: totalXP + xpEarned, coins: totalCoins + coinsEarned })
      )
    } catch (e) {
      console.error("Failed to save points:", e)
    }
  }, [totalXP, totalCoins])

  return {
    totalXP,
    totalCoins,
    addPoints,
    lastUpdate,
    showAnimation,
  }
}
