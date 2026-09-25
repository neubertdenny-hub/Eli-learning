"use client"

import React, { useState, useEffect } from "react"
import type { PracticeExam, PracticeExamTask } from "@/lib/exam/practice-exam-generator"

interface PracticeExamSimulatorProps {
  exam: PracticeExam
  onComplete: (answers: any) => void
  onCancel: () => void
}

export function PracticeExamSimulator({
  exam,
  onComplete,
  onCancel,
}: PracticeExamSimulatorProps) {
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [scoreData, setScoreData] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState(exam.estimatedTotalMinutes * 60)

  const currentTask = exam.tasks[currentTaskIdx]
  const isLastTask = currentTaskIdx === exam.tasks.length - 1
  const allAnswered = exam.tasks.every((t) => answers[t.id])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleSubmitAll()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (taskId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [taskId]: answer,
    }))
  }

  const handleNext = () => {
    if (!isLastTask) {
      setCurrentTaskIdx((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentTaskIdx > 0) {
      setCurrentTaskIdx((prev) => prev - 1)
    }
  }

  const handleSubmitAll = async () => {
    setIsSubmitting(true)
    try {
      // Score the exam
      const taskAnswers = exam.tasks.map((task) => ({
        taskId: task.id,
        topicId: task.topicId,
        userAnswer: answers[task.id] || "",
        isCorrect: answers[task.id] === task.correctAnswer,
        pointsEarned: answers[task.id] === task.correctAnswer ? task.pointsPossible : 0,
        pointsPossible: task.pointsPossible,
      }))

      const response = await fetch("/api/exam/simulation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.examId,
          practiceExamId: exam.id,
          resultId: `result-${exam.id}`,
          taskAnswers,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit")

      const result = await response.json()
      setScoreData(result)
      setShowResults(true)
      onComplete(result)
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
        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-screen overflow-y-auto">
          <div className="text-center space-y-4">
            <div className="text-6xl">
              {scoreData.score >= 85 ? "🎉" : scoreData.score >= 70 ? "👍" : "💪"}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {scoreData.score >= 85
                ? "Ausgezeichnet!"
                : scoreData.score >= 70
                  ? "Gute Vorbereitung!"
                  : "Gute Arbeit!"}
            </h2>
            <div className="space-y-2">
              <p className="text-5xl font-bold text-blue-600">{scoreData.score}%</p>
              <p className="text-gray-600">
                {scoreData.points.earned} / {scoreData.points.total} Punkte
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <p className="text-lg text-gray-900">{scoreData.feedback}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900">Nächste Schritte:</h3>
            <ul className="space-y-1 text-gray-700">
              <li>✅ Detaillierte Topic-Analyse (wird vorbereitet)</li>
              <li>✅ Personalisierte Lernempfehlungen</li>
              <li>✅ Schwache Bereiche identifiziert</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
            >
              Schließen
            </button>
            <button
              onClick={() => {
                setCurrentTaskIdx(0)
                setAnswers({})
                setShowResults(false)
                setTimeRemaining(exam.estimatedTotalMinutes * 60)
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              Nochmal versuchen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-6 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              📝 {exam.title}
            </h2>
            <p className="text-sm text-gray-600">
              Aufgabe {currentTaskIdx + 1} von {exam.tasks.length}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeRemaining < 300 ? "text-red-600" : "text-gray-900"}`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-gray-600">Zeit verbleibend</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{
                width: `${((currentTaskIdx + 1) / exam.tasks.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Task */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {currentTask.topicName} • {currentTask.difficulty}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {currentTask.taskText}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {currentTask.pointsPossible} Punkte • ca. {currentTask.estimatedMinutes} min
            </p>
          </div>

          {/* Answers */}
          {currentTask.taskType === "multiple-choice" && (
            <div className="space-y-2 mt-4">
              {currentTask.options?.map((option, idx) => (
                <label
                  key={idx}
                  className="flex items-center p-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition bg-white"
                >
                  <input
                    type="radio"
                    name={currentTask.id}
                    value={option}
                    checked={answers[currentTask.id] === option}
                    onChange={(e) =>
                      handleAnswerChange(currentTask.id, e.target.value)
                    }
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {(currentTask.taskType === "short-answer" ||
            currentTask.taskType === "calculation" ||
            currentTask.taskType === "open-ended") && (
            <textarea
              placeholder={`Deine Antwort${currentTask.taskType === "calculation" ? " (z.B. 42 oder 3/4)" : ""}...`}
              value={answers[currentTask.id] || ""}
              onChange={(e) =>
                handleAnswerChange(currentTask.id, e.target.value)
              }
              className="w-full border-2 border-gray-300 rounded-lg p-3 min-h-24 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
          >
            Abbrechen
          </button>
          <button
            onClick={handlePrevious}
            disabled={currentTaskIdx === 0}
            className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
          >
            ← Zurück
          </button>
          <div className="flex-1" />
          {!isLastTask ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleSubmitAll}
              disabled={!allAnswered || isSubmitting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              {isSubmitting ? "⏳ Wird bewertet..." : "✅ Abschließen"}
            </button>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center">
          ⚠️ Keine Hilfe verfügbar. Voice kann Aufgaben vorlesen (Text only).
        </p>
      </div>
    </div>
  )
}
