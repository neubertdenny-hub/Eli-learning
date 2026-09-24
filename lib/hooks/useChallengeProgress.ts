import { useCallback } from "react"

/**
 * Hook to track and update daily challenge progress
 */
export function useChallengeProgress() {
  const updateChallengeProgress = useCallback(
    async (userId: string, challengeId: string, amount: number = 1) => {
      try {
        const res = await fetch("/api/challenges/daily/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, challengeId, amount }),
        })
        return await res.json()
      } catch (error) {
        console.error("Error updating challenge progress:", error)
      }
    },
    []
  )

  const handleTaskCorrect = useCallback(
    async (userId: string) => {
      // Update "solve_tasks" challenge
      await updateChallengeProgress(userId, "solve_5", 1)
    },
    [updateChallengeProgress]
  )

  const handleHintUsed = useCallback(
    async (userId: string) => {
      // Update "use_hints" challenge
      await updateChallengeProgress(userId, "use_hints_10", 1)
    },
    [updateChallengeProgress]
  )

  return {
    updateChallengeProgress,
    handleTaskCorrect,
    handleHintUsed,
  }
}
