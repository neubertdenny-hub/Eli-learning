"use client"

import React from "react"

interface TopicPerformance {
  topicId: string
  topicName: string
  correct: number
  total: number
  percentage: number
}

interface ExamResultsDisplayProps {
  score: number
  pointsEarned: number
  pointsTotal: number
  topicPerformance?: TopicPerformance[]
  feedback: string
  nextSteps?: string[]
  onClose: () => void
}

export function ExamResultsDisplay({
  score,
  pointsEarned,
  pointsTotal,
  topicPerformance = [],
  feedback,
  nextSteps = [],
  onClose,
}: ExamResultsDisplayProps) {
  const strengthTopics = topicPerformance.filter((t) => t.percentage >= 80)
  const weakTopics = topicPerformance.filter((t) => t.percentage < 70)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl">
            {score >= 85 ? "🎉" : score >= 70 ? "👍" : "💪"}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {score >= 85
              ? "Ausgezeichnet!"
              : score >= 70
                ? "Gute Vorbereitung!"
                : "Gute Arbeit!"}
          </h2>
          <div className="space-y-2">
            <p className="text-5xl font-bold text-blue-600">{score}%</p>
            <p className="text-gray-600">
              {pointsEarned} / {pointsTotal} Punkte
            </p>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <p className="text-lg text-gray-900">{feedback}</p>
        </div>

        {/* Topic Performance */}
        {topicPerformance.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              📊 Topic-Performance
            </h3>

            {/* Strengths */}
            {strengthTopics.length > 0 && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-2">
                <p className="font-bold text-green-900">✅ Deine Stärken:</p>
                {strengthTopics.map((topic) => (
                  <div
                    key={topic.topicId}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-900">{topic.topicName}</span>
                    <span className="font-bold text-green-600">
                      {topic.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* All Topics */}
            <div className="space-y-2">
              {topicPerformance.map((topic) => (
                <div
                  key={topic.topicId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{topic.topicName}</p>
                    <p className="text-sm text-gray-600">
                      {topic.correct}/{topic.total} korrekt
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{topic.percentage}%</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${
                          topic.percentage >= 80
                            ? "bg-green-600"
                            : topic.percentage >= 70
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weaknesses */}
            {weakTopics.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 space-y-2">
                <p className="font-bold text-orange-900">
                  ⚠️ Noch Verbesserungspotential:
                </p>
                {weakTopics.map((topic) => (
                  <div
                    key={topic.topicId}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-900">{topic.topicName}</span>
                    <span className="font-bold text-orange-600">
                      {topic.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">📝 Nächste Schritte:</h3>
            <ul className="space-y-2">
              {nextSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-blue-600 font-bold">→</span>
                  <span className="text-gray-900">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
        >
          Schließen
        </button>
      </div>
    </div>
  )
}
