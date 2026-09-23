"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { EliSpeaking } from "@/components/eli/EliRobot"

export interface MissionSummary {
  successRate: number // 0-100
  taskCount: number
  successfulTasks: number
  timeSpentMinutes: number
  xpEarned: number
  nextTopic?: string
  perfectStreak: boolean
  foundationGapsDetected: number
  achievements: string[]
}

interface MissionEndScreenProps {
  summary: MissionSummary
  onContinue?: () => void
}

export function MissionEndScreen({ summary, onContinue }: MissionEndScreenProps) {
  useEffect(() => {
    // Celebration Sound/Animation könnte hier starten
    if (summary.successRate >= 80) {
      // 🎉 trigger
    }
  }, [summary.successRate])

  const getMood = (): "excited" | "happy" | "thinking" | "explaining" => {
    if (summary.successRate >= 90) return "excited"
    if (summary.successRate >= 80) return "happy"
    if (summary.successRate >= 60) return "thinking"
    return "explaining"
  }

  const getCelebrationMessage = (): string => {
    if (summary.successRate >= 90) {
      return "Perfekt! Du bist auf Feuer! 🔥"
    }
    if (summary.successRate >= 80) {
      return "Großartig! Du machst echten Fortschritt! ⭐"
    }
    if (summary.successRate >= 60) {
      return "Gut gemacht! Du lernst schnell! 💪"
    }
    return "Guter Versuch! Weiter so! 🚀"
  }

  const getRecommendation = (): string => {
    if (summary.foundationGapsDetected > 0) {
      return `Wir haben ein paar Grundlagen-Lücken erkannt. Morgen üben wir die nochmal!`
    }
    if (summary.nextTopic) {
      return `Nächstes Mal: "${summary.nextTopic}". Du wirst es schaffen! 💡`
    }
    return "Weiter so mit dem gleichen Thema - du wirst besser!"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Eli Celebration */}
        <div className="flex justify-center">
          <EliSpeaking mood={getMood()} size="lg" message={getCelebrationMessage()} />
        </div>

        {/* Main Stats Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-200 overflow-hidden">
          {/* Header with Progress */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-6">🎉 Mission Abgeschlossen!</h1>

            {/* Success Rate Ring */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Circular Progress */}
                  <svg className="absolute w-32 h-32" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="white"
                      strokeWidth="8"
                      strokeDasharray={`${(summary.successRate / 100) * 352} 352`}
                      style={{ transition: "stroke-dasharray 1s ease-in-out" }}
                    />
                  </svg>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{summary.successRate}%</div>
                    <div className="text-sm opacity-90">Erfolg</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✅</span>
                  <span>
                    {summary.successfulTasks} von {summary.taskCount} Aufgaben
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⏱️</span>
                  <span>{summary.timeSpentMinutes} Minuten</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  <span>+{summary.xpEarned} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Abzeichen</h2>

            {summary.perfectStreak && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">🔥</div>
                  <div>
                    <p className="font-bold text-lg text-yellow-900">Perfekter Streak!</p>
                    <p className="text-sm text-yellow-700">Alle Aufgaben ohne Fehler gelöst</p>
                  </div>
                </div>
              </div>
            )}

            {summary.achievements.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 text-center"
                  >
                    <p className="text-4xl mb-2">⭐</p>
                    <p className="font-bold text-gray-900">{achievement}</p>
                  </div>
                ))}
              </div>
            )}

            {summary.achievements.length === 0 && (
              <p className="text-gray-600 text-center py-6">
                Keine neuen Abzeichen diese Runde, aber gute Arbeit! 💪
              </p>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 border-t-2 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div>
                <p className="font-bold text-lg text-gray-900 mb-2">Tipp für nächstes Mal</p>
                <p className="text-gray-700">{getRecommendation()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mastery Summary */}
        {summary.foundationGapsDetected > 0 && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">⚠️</div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {summary.foundationGapsDetected} Grundlagen-Lücke
                  {summary.foundationGapsDetected > 1 ? "n" : ""} erkannt
                </h3>
                <p className="text-gray-700">
                  Das ist normal beim Lernen! Wir bauen morgen Brücken dafür. 🌉
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
          >
            🎯 Nächste Mission
          </button>

          <Link
            href="/"
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-8 rounded-xl text-lg border-2 border-gray-300 hover:border-gray-400 transition-all text-center"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Footer Message */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 text-center">
          <p className="text-gray-700 font-medium">
            💪 Fantastisch, dass du lernst! Jede Übung bringt dich näher zu deinem Ziel.
          </p>
        </div>
      </div>
    </div>
  )
}
