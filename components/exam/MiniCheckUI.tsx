"use client"

import React, { useState } from "react"
import type { MiniCheckSession, TransferTask } from "@/lib/exam/mini-checks"
import { isMiniCheckPassed, generateMiniCheckFeedback } from "@/lib/exam/mini-checks"

interface MiniCheckUIProps {
  session: MiniCheckSession
  onSubmit?: (session: MiniCheckSession) => void
  onSkip?: () => void
}

export function MiniCheckUI({ session, onSubmit, onSkip }: MiniCheckUIProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [userAnswers, setUserAnswers] = useState(session.userAnswers)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const currentQuestion = session.questions[currentQuestionIdx]
  const isLastQuestion = currentQuestionIdx === session.questions.length - 1
  const progress = ((currentQuestionIdx + 1) / session.questions.length) * 100

  const handleAnswer = (answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion.id]: answer,
    })
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIdx(currentQuestionIdx + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const updatedSession: MiniCheckSession = {
      ...session,
      userAnswers,
      completedAt: new Date().toISOString(),
    }
    setIsSubmitted(true)
    onSubmit?.(updatedSession)
  }

  if (isSubmitted && session.score !== undefined) {
    return <MiniCheckResult session={{ ...session, userAnswers, score: session.score }} onContinue={() => onSkip?.()} />
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900">
            ✅ Mini-Check: {session.topicName}
          </h2>
          <span className="text-sm font-semibold text-gray-600">
            {currentQuestionIdx + 1}/{session.questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8 space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-blue-600">Frage {currentQuestionIdx + 1}</p>
          <h3 className="text-xl font-bold text-gray-900">{currentQuestion.questionText}</h3>
        </div>

        {/* Multiple Choice */}
        {currentQuestion.questionType === "multiple-choice" && currentQuestion.options && (
          <div className="space-y-2 pt-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  userAnswers[currentQuestion.id] === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      userAnswers[currentQuestion.id] === option
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {userAnswers[currentQuestion.id] === option && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Short Answer */}
        {currentQuestion.questionType === "short-answer" && (
          <textarea
            value={userAnswers[currentQuestion.id] || ""}
            onChange={e => handleAnswer(e.target.value)}
            placeholder="Deine Antwort..."
            className="w-full border-2 border-gray-300 rounded-lg p-3 h-24 focus:border-blue-500 focus:outline-none resize-none"
          />
        )}

        {/* Calculation */}
        {currentQuestion.questionType === "calculation" && (
          <input
            type="text"
            value={userAnswers[currentQuestion.id] || ""}
            onChange={e => handleAnswer(e.target.value)}
            placeholder="Ergebnis eingeben..."
            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
          />
        )}

        {/* Difficulty Badge */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold">
            {currentQuestion.difficulty === "easy" && "😊 Leicht"}
            {currentQuestion.difficulty === "medium" && "💪 Mittel"}
            {currentQuestion.difficulty === "hard" && "🔥 Schwer"}
          </span>
          <span className="text-xs text-gray-600">⏱️ ca. {currentQuestion.estimatedSeconds}s</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onSkip}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all"
        >
          Überspringen
        </button>

        <button
          onClick={handleNext}
          disabled={!userAnswers[currentQuestion.id]}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
        >
          {isLastQuestion ? "✅ Beenden" : "Nächste →"}
        </button>
      </div>

      {/* Answer Hint */}
      {userAnswers[currentQuestion.id] && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p>
            <strong>Deine Antwort:</strong> {userAnswers[currentQuestion.id]}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Ergebnis-Screen nach Mini-Check
 */
function MiniCheckResult({
  session,
  onContinue,
}: {
  session: MiniCheckSession & { score: number }
  onContinue?: () => void
}) {
  const passed = isMiniCheckPassed(session)
  const feedback = generateMiniCheckFeedback(session)
  const correctCount = Object.values(session.isCorrect || {}).filter(Boolean).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Result Card */}
      <div className={`rounded-2xl border-2 p-8 space-y-4 text-center ${
        passed
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}>
        <div className="text-6xl">{passed ? "🎉" : "💪"}</div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {session.score}%
          </h2>
          <p className="text-xl font-semibold text-gray-700">
            {correctCount}/{session.questions.length} korrekt
          </p>
        </div>

        {/* Feedback */}
        <p className="text-lg text-gray-700 pt-2">{feedback}</p>

        {/* Time Spent */}
        {session.timeSpent && (
          <p className="text-sm text-gray-600">
            ⏱️ Du hast {Math.round(session.timeSpent / 60)} Minuten gebraucht
          </p>
        )}
      </div>

      {/* Review */}
      {session.isCorrect && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-3">
          <h3 className="text-lg font-bold text-gray-900">📝 Übersicht</h3>

          <div className="space-y-2">
            {session.questions.map((q, idx) => {
              const correct = session.isCorrect?.[q.id]
              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-lg border ${
                    correct
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{correct ? "✅" : "❌"}</span>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-900">
                        Frage {idx + 1}: {q.questionText}
                      </p>
                      <p className="text-gray-600 mt-1">
                        Deine Antwort: <strong>{session.userAnswers[q.id]}</strong>
                      </p>
                      {!correct && (
                        <p className="text-gray-600 mt-1">
                          Richtig: <strong>{q.correctAnswer}</strong>
                        </p>
                      )}
                      <p className="text-gray-600 mt-2 italic">💡 {q.explanation}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Next Action */}
      <button
        onClick={onContinue}
        className={`w-full font-bold py-4 px-6 rounded-xl transition-all text-lg ${
          passed
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {passed ? "🚀 Weiter zum nächsten Thema" : "💪 Nochmal üben"}
      </button>
    </div>
  )
}

/**
 * Transfer Task UI
 */
interface TransferTaskUIProps {
  task: TransferTask
  onSubmit?: (solution: string) => void
}

export function TransferTaskUI({ task, onSubmit }: TransferTaskUIProps) {
  const [solution, setSolution] = useState("")
  const [showHints, setShowHints] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white space-y-3">
        <h2 className="text-3xl font-bold">🔗 Transfer-Aufgabe</h2>
        <p className="text-purple-100">{task.description}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          {task.relatedTopicNames.map((topic, idx) => (
            <span
              key={idx}
              className="text-xs bg-white text-purple-700 px-3 py-1 rounded-full font-semibold"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Task */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-4">
        <div className="space-y-3 pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
          <p className="text-gray-700 whitespace-pre-line">{task.taskText}</p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <p className="font-semibold text-gray-900">📋 Schritte:</p>
          {task.steps.map((step, idx) => (
            <div key={idx} className="flex gap-3 text-sm text-gray-700">
              <span className="text-gray-400">{step}</span>
            </div>
          ))}
        </div>

        {/* Difficulty & Time */}
        <div className="flex gap-3 pt-3 border-t">
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
            {task.difficulty === "hard" ? "🔥 Schwer" : "💪 Mittel"}
          </span>
          <span className="text-xs text-gray-600">⏱️ ca. {task.estimatedMinutes} min</span>
        </div>
      </div>

      {/* Solution Input */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-3">
        <label className="font-bold text-gray-900">Deine Lösung:</label>
        <textarea
          value={solution}
          onChange={e => setSolution(e.target.value)}
          placeholder="Schreibe alle Schritte auf..."
          className="w-full border-2 border-gray-300 rounded-lg p-4 h-40 focus:border-blue-500 focus:outline-none resize-none"
        />

        <p className="text-sm text-gray-600">
          Expected Output: {task.expectedOutput}
        </p>
      </div>

      {/* Hints */}
      <div className="space-y-2">
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          {showHints ? "▼" : "▶"} Tipps anzeigen
        </button>

        {showHints && (
          <div className="space-y-2">
            {task.hints.map((hint, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                {hint}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={() => onSubmit?.(solution)}
        disabled={!solution.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50"
      >
        🚀 Lösung einreichen
      </button>
    </div>
  )
}
