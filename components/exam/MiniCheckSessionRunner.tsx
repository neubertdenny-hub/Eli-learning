"use client"

import React, { useState } from "react"
import type { MiniCheckSession, MiniCheckQuestion } from "@/lib/exam/mini-checks"

interface MiniCheckSessionRunnerProps {
  session: MiniCheckSession
  onComplete: (scoredSession: any) => void
  onCancel: () => void
}

export function MiniCheckSessionRunner({
  session,
  onComplete,
  onCancel,
}: MiniCheckSessionRunnerProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(session.userAnswers || {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [scoreData, setScoreData] = useState<any>(null)

  const currentQuestion = session.questions[currentQuestionIdx]
  const isLastQuestion = currentQuestionIdx === session.questions.length - 1
  const allAnswered = session.questions.every((q) => answers[q.id])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmitQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIdx((prev) => prev + 1)
    }
  }

  const handleSubmitAll = async () => {
    if (!allAnswered) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/exam/mini-check", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          session: { ...session, userAnswers: answers, completedAt: new Date().toISOString() },
        }),
      })

      if (!response.ok) throw new Error("Failed to submit")

      const result = await response.json()
      setScoreData(result)
      setShowResults(true)
      onComplete(result.session)
    } catch (error) {
      console.error("Submit error:", error)
      alert("❌ Fehler beim Absenden")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showResults && scoreData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {scoreData.passed ? "✅" : "⚠️"}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {scoreData.passed ? "Sehr gut bestanden!" : "Noch nicht bestanden"}
            </h2>
            <p className="text-2xl font-bold text-blue-600">
              {scoreData.score}%
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <p className="text-gray-900">{scoreData.feedback}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
            >
              Schließen
            </button>
            {!scoreData.passed && (
              <button
                onClick={() => {
                  setCurrentQuestionIdx(0)
                  setAnswers({})
                  setShowResults(false)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                Nochmal versuchen
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            📝 Mini-Check: {session.topicName}
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIdx + 1) / session.questions.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Frage {currentQuestionIdx + 1} von {session.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-lg font-bold text-gray-900">
              {currentQuestion.questionText}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              ⏱️ ca. {currentQuestion.estimatedSeconds} Sekunden
            </p>
          </div>

          {/* Answers */}
          {currentQuestion.questionType === "multiple-choice" && (
            <div className="space-y-2">
              {currentQuestion.options?.map((option, idx) => (
                <label
                  key={idx}
                  className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.questionType === "short-answer" && (
            <input
              type="text"
              placeholder="Deine Antwort..."
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            />
          )}

          {currentQuestion.questionType === "calculation" && (
            <input
              type="text"
              placeholder="Deine Antwort (z.B. 42 oder 3/4)..."
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
          >
            Abbrechen
          </button>
          {!isLastQuestion ? (
            <button
              onClick={handleSubmitQuestion}
              disabled={!answers[currentQuestion.id]}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleSubmitAll}
              disabled={!allAnswered || isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {isSubmitting ? "⏳ Wird bewertet..." : "✅ Abschließen"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
