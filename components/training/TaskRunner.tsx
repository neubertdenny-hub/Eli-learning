"use client"

import React, { useState, useRef } from "react"
import { EliSpeaking } from "@/components/eli/EliRobot"

export interface Task {
  id: string
  title: string
  problem_statement: string
  difficulty_level: number
  category: "calculation" | "problem_solving" | "conceptual"
  solution?: string
  solution_steps?: Array<{
    step_number: number
    description: string
    explanation: string
    visual_hint?: string
  }>
}

export interface TaskRunnerProps {
  task: Task
  onSubmit: (answer: string, helpLevelUsed: number) => Promise<void>
  onCompleted?: (success: boolean) => void
}

export function TaskRunner({ task, onSubmit, onCompleted }: TaskRunnerProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<"loading" | "correct" | "incorrect" | null>(null)
  const [currentHelpLevel, setCurrentHelpLevel] = useState(0)
  const [showHelpOptions, setShowHelpOptions] = useState(false)
  const [helpHistory, setHelpHistory] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return

    setIsSubmitting(true)
    setFeedback("loading")

    try {
      await onSubmit(userAnswer, currentHelpLevel)
      // Feedback wird vom Parent gesetzt
    } catch (error) {
      console.error("Error submitting answer:", error)
      setFeedback(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestHelp = (level: number) => {
    setCurrentHelpLevel(level)
    setHelpHistory([...helpHistory, level])
    setShowHelpOptions(false)
    // Help wird vom Parent nach API-Call gegeben
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border-3 border-blue-300 p-6 sm:p-8 space-y-6">
      {/* Eli Robot Status */}
      <div className="flex justify-center">
        <EliSpeaking mood="thinking" size="md" />
      </div>

      {/* Problem Statement */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {task.problem_statement}
        </h2>
        <p className="text-sm text-gray-600">
          Schwierigkeit: {Array(task.difficulty_level).fill("⭐").join("")}
        </p>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <label className="text-base font-bold text-gray-700">✍️ Deine Antwort:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
            placeholder="Antw eingeben..."
            disabled={isSubmitting || feedback === "loading"}
            className="flex-1 border-3 border-gray-300 rounded-lg p-4 text-center text-2xl font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 disabled:bg-gray-100"
            autoFocus
          />
          <button
            onClick={() => setShowHelpOptions(!showHelpOptions)}
            className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
            disabled={isSubmitting || feedback === "loading"}
            title="Hilfe anfordern"
          >
            💡
          </button>
        </div>

        {/* Help Level Options */}
        {showHelpOptions && (
          <div className="grid grid-cols-3 gap-2 bg-yellow-50 p-3 rounded-lg">
            <button
              onClick={() => handleRequestHelp(1)}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 p-2 rounded font-bold"
            >
              Level 1<br />Kleiner Tipp
            </button>
            <button
              onClick={() => handleRequestHelp(2)}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 p-2 rounded font-bold"
            >
              Level 2<br />Richtung
            </button>
            <button
              onClick={() => handleRequestHelp(3)}
              className="text-xs bg-yellow-100 hover:bg-yellow-200 p-2 rounded font-bold"
            >
              Level 3<br />Erklärung
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitAnswer}
        disabled={!userAnswer.trim() || isSubmitting || feedback === "loading"}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg disabled:shadow-none"
      >
        {feedback === "loading" ? "⏳ Prüfe..." : "✅ Überprüfen"}
      </button>

      {/* Feedback Display */}
      {feedback === "correct" && (
        <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center animate-pulse">
          <p className="text-xl font-bold text-green-700">✅ Richtig!</p>
          <p className="text-sm text-green-600 mt-2">Großartig, Zoey! Du machst Fortschritt! 🎉</p>
        </div>
      )}

      {feedback === "incorrect" && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-red-700">❌ Versuche es nochmal!</p>
          <p className="text-sm text-red-600 mt-2">Du schaffst das! 💪</p>
        </div>
      )}

      {/* Help History Indicator */}
      {helpHistory.length > 0 && (
        <div className="text-xs text-gray-600 text-center">
          📚 Hilfe-Level verwendet: {helpHistory.join(", ")}
        </div>
      )}
    </div>
  )
}
