"use client"

import React, { useEffect } from "react"
import { EliSpeaking } from "@/components/eli/EliRobot"
import type { EliReaction } from "@/lib/gamification/eli-reactions"

export interface MissionCompletionCelebrationProps {
  show: boolean
  xpEarned: number
  coinsEarned: number
  newLevel?: number
  badgesUnlocked?: string[]
  eliReaction: EliReaction
  onClose: () => void
}

/**
 * Mission Completion Celebration
 * Zeigt Belohnungen, Eli Reaction und Celebration Animation
 */
export function MissionCompletionCelebration({
  show,
  xpEarned,
  coinsEarned,
  newLevel,
  badgesUnlocked,
  eliReaction,
  onClose,
}: MissionCompletionCelebrationProps) {
  useEffect(() => {
    if (show && eliReaction.duration) {
      const timer = setTimeout(onClose, eliReaction.duration)
      return () => clearTimeout(timer)
    }
  }, [show, eliReaction.duration, onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scaleIn space-y-6">
        {/* Eli Reaction */}
        <div className="flex justify-center">
          <EliSpeaking mood={(eliReaction.mood as any) || "happy"} size="lg" message={eliReaction.message} />
        </div>

        {/* Reaction Message */}
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{eliReaction.message}</p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* XP Card */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 text-center border-2 border-blue-300">
            <p className="text-sm font-bold text-blue-600 mb-1">XP VERDIENT</p>
            <p className="text-3xl font-bold text-blue-700">+{xpEarned}</p>
          </div>

          {/* Coins Card */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 text-center border-2 border-yellow-300">
            <p className="text-sm font-bold text-yellow-600 mb-1">COINS</p>
            <p className="text-3xl font-bold text-yellow-700">+{coinsEarned} 🪙</p>
          </div>
        </div>

        {/* Level Up Highlight */}
        {newLevel && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-center animate-pulse">
            <p className="text-white font-bold text-lg">🎉 LEVEL UP!</p>
            <p className="text-white text-2xl font-bold">Level {newLevel}</p>
          </div>
        )}

        {/* Badges */}
        {badgesUnlocked && badgesUnlocked.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-700 text-center">🏆 BADGES FREIGESCHALTET</p>
            <div className="grid grid-cols-1 gap-2">
              {badgesUnlocked.map((badge) => (
                <div
                  key={badge}
                  className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-3 text-center border-2 border-amber-300 animate-bounce"
                >
                  <p className="font-bold text-amber-800">{badge}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
        >
          ✨ Weiter geht's!
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
}
