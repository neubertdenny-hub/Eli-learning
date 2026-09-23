"use client"

import React, { useState, useEffect } from "react"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { DailyMission, MissionBlock } from "@/lib/learning/mission-planner"

interface MissionStartScreenProps {
  mission: DailyMission
  onStart: () => void
  onSkip?: () => void
  loading?: boolean
}

export function MissionStartScreen({
  mission,
  onStart,
  onSkip,
  loading = false,
}: MissionStartScreenProps) {
  const [missionReady, setMissionReady] = useState(!!mission)

  useEffect(() => {
    setMissionReady(!!mission && mission.blocks.length > 0)
  }, [mission])

  const getBlockIcon = (type: string): string => {
    const icons: Record<string, string> = {
      WARM_UP: "🔥",
      CURRENT_SCHOOL_TOPIC: "📚",
      FOUNDATION_REPAIR: "🔧",
      REVIEW: "🔄",
      PRACTICE: "💪",
      CHALLENGE: "⭐",
      TRANSFER_CHECK: "🎯",
      DIAGNOSIS: "🔍",
    }
    return icons[type] || "📋"
  }

  const getBlockLabel = (type: string): string => {
    const labels: Record<string, string> = {
      WARM_UP: "Warm-up",
      CURRENT_SCHOOL_TOPIC: "Schule",
      FOUNDATION_REPAIR: "Grundlagen",
      REVIEW: "Wiederholung",
      PRACTICE: "Übung",
      CHALLENGE: "Challenge",
      TRANSFER_CHECK: "Transfer Check",
      DIAGNOSIS: "Diagnose",
    }
    return labels[type] || "Aufgabe"
  }

  if (loading || !missionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-6xl animate-spin">⚙️</div>
          <h1 className="text-3xl font-bold text-gray-900">ELI bereitet deine Mission vor...</h1>
          <p className="text-lg text-gray-600">Ich analysiere deine Lerndaten und erstelle einen perfekten Plan für dich</p>
          <div className="flex justify-center">
            <EliSpeaking mood="thinking" size="md" message="Einen Moment..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Eli Welcome */}
        <div className="flex justify-center">
          <EliSpeaking
            mood="excited"
            size="lg"
            message="Ich habe deine persönliche Mission geplant! 🤖"
          />
        </div>

        {/* Mission Summary */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              🚀 Deine Mission heute
            </h1>
            <p className="text-lg text-gray-600">
              Insgesamt ca. {mission.targetMinutes} Minuten
            </p>
          </div>

          {/* Selection Reasoning */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-200">
            <p className="text-center text-gray-800 font-medium">
              <span className="text-2xl">💡</span> {mission.selectionReasoning}
            </p>
          </div>

          {/* Mission Blocks */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dein Plan:</h2>

            {mission.blocks.map((block, index) => (
              <div
                key={block.id}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getBlockIcon(block.type)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                          Schritt {index + 1}
                        </span>
                        {block.selectionReason && (
                          <span className="text-xs text-gray-500">
                            ({formatReason(block.selectionReason)})
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {block.topicName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getBlockLabel(block.type)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-600">
                      {block.targetTaskCount}
                    </div>
                    <div className="text-xs text-gray-500">Aufgabe(n)</div>
                    <div className="text-sm font-semibold text-gray-700 mt-2">
                      ~{block.estimatedMinutes}min
                    </div>
                  </div>
                </div>

                {/* Progress Bar Placeholder */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                    style={{ width: `${(index / mission.blocks.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Key Points */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-bold text-green-900">Personalisiert</div>
              <div className="text-xs text-green-700">Basierend auf deinen Daten</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm font-bold text-blue-900">Adaptiv</div>
              <div className="text-xs text-blue-700">Passt sich an deine Performance an</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-sm font-bold text-purple-900">Ca. {mission.targetMinutes}min</div>
              <div className="text-xs text-purple-700">Flexibles Zeitbudget</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStart}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
          >
            🚀 Mission starten
          </button>

          {onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-8 rounded-xl text-lg border-2 border-gray-300 hover:border-gray-400 transition-all"
            >
              Etwas anderes üben →
            </button>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-gray-700">
            <span className="font-semibold">💡 Tipp:</span> Du kannst die Mission jederzeit pausieren.
            Wenn du die App schließt, speichern wir deinen Fortschritt.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Formatiere Selection Reason für UI
 */
function formatReason(reason: string): string {
  const labels: Record<string, string> = {
    CURRENT_SCHOOL_TOPIC: "Aktueller Schulstoff",
    FOUNDATION_GAP: "Grundlage",
    REVIEW_DUE: "Wiederholung fällig",
    REPEATED_ERROR: "Häufiger Fehler",
    LOW_MASTERY: "Noch nicht sicher",
    CONFIDENCE_DECAY: "Zu lange nicht überprüft",
    TRANSFER_CHECK: "Transfer-Kontrolle",
    CHALLENGE: "Challenge",
    WARM_UP: "Warm-up",
  }
  return labels[reason] || reason
}
