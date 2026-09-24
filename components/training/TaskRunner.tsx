"use client"

import React, { useState, useRef, useEffect } from "react"
import { EliSpeaking } from "@/components/eli/EliRobot"
import type { HelpLevel } from "@/lib/learning/dynamic-help-generator"

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
  const [helpMessage, setHelpMessage] = useState<string>("")
  const [helpLoading, setHelpLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Laden von dynamischen Hilfe-Tipps vom Server
  const loadDynamicHelp = async (level: number) => {
    setHelpLoading(true)
    try {
      if (!task.solution) {
        console.warn("Task hat keine solution:", task)
        return getFallbackHelpMessage(level)
      }

      const response = await fetch("/api/generate-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: task.problem_statement,
          solution: task.solution,
          helpLevels: [level],
        }),
      })

      if (!response.ok) {
        console.error("Help API error:", response.status)
        return getFallbackHelpMessage(level)
      }

      const data = await response.json()

      if (data.success && data.helpLevels && data.helpLevels.length > 0) {
        const helpLevel = data.helpLevels[0]
        return `${helpLevel.emoji} ${helpLevel.hint}`
      } else if (data.fallback && data.helpLevels && data.helpLevels.length > 0) {
        // Fallback Hilfe wenn OpenAI nicht verfügbar
        const helpLevel = data.helpLevels[level - 1]
        return `${helpLevel.emoji} ${helpLevel.hint}`
      }

      console.warn("Unexpected help response:", data)
      return getFallbackHelpMessage(level)
    } catch (error) {
      console.error("Error loading dynamic help:", error)
      return getFallbackHelpMessage(level)
    } finally {
      setHelpLoading(false)
    }
  }

  const getFallbackHelpMessage = (level: number): string => {
    // Intelligente Fallback-Tipps basierend auf Aufgaben-Pattern
    const problem = task.problem_statement.toLowerCase()
    const solution = task.solution?.toString().toLowerCase() || ""

    // Erkenne Aufgaben-Typen
    const isAddition = problem.includes("+")
    const isSubtraction = problem.includes("-") && !problem.includes("(")
    const isMultiplication = problem.includes("*") || problem.includes("×")
    const isDivision = problem.includes("/") || problem.includes("÷")
    const isNegative = problem.includes("(") && problem.includes("-")
    const isFraction = problem.includes("/")
    const isEquation = problem.includes("=")

    // Level 1: Kleine Hinweise
    if (level === 1) {
      if (isNegative) return "💡 Hinweis: Negative Zahl bedeutet das Gegenteil!"
      if (isFraction) return "💡 Hinweis: Zähler (oben) und Nenner (unten) beachten!"
      if (isMultiplication) return "💡 Hinweis: Wie oft wird die Zahl addiert?"
      if (isDivision) return "💡 Hinweis: In wie viele Teile wird geteilt?"
      return "💡 Hinweis: Lies die Aufgabe genau und identifiziere alle Zahlen und Symbole!"
    }

    // Level 2: Richtung & Methode
    if (level === 2) {
      if (isNegative) return "🧭 Methode: Positive nach rechts, negative nach links auf dem Zahlenstrahl!"
      if (isFraction) return "🧭 Methode: Wenn Nenner gleich, addiere/subtrahiere nur die Zähler!"
      if (isMultiplication) return "🧭 Methode: Zähle wie oft du die Zahl addieren würdest!"
      if (isDivision) return "🧭 Methode: Wie viel bekommt jedes Teil davon?"
      if (isAddition) return "🧭 Methode: Zähle von der ersten Zahl aus weiter nach oben!"
      if (isSubtraction) return "🧭 Methode: Zähle von der ersten Zahl aus nach unten!"
      return "🧭 Methode: Versuche die Aufgabe in kleine Schritte zu zerlegen!"
    }

    // Level 3: Vollständige Erklärung
    if (level === 3) {
      if (isNegative)
        return `📚 Erklärung: "${problem}" = positive + negative. Das ist wie: erste Zahl - absolute Wert der zweiten. Lösung: ${solution || "versuche zu berechnen!"}`
      if (isFraction)
        return `📚 Erklärung: Bei Brüchen: Zähler oben addieren/subtrahieren, Nenner unten bleibt gleich! "${problem}" = "${solution || "?"}"`
      if (isMultiplication)
        return `📚 Erklärung: Multiplikation = wiederholte Addition. "${problem}" bedeutet die erste Zahl so oft addieren wie die zweite sagt!`
      if (isDivision)
        return `📚 Erklärung: Division = verteilen. "${problem}" bedeutet: teile die erste Zahl in so viele Teile wie die zweite sagt!`
      return `📚 Erklärung: Schreib alle Schritte auf: 1) Zahlen identifizieren, 2) Operation erkennen, 3) Berechnen, 4) Kontrolle. Lösung: ${solution || "?"}`
    }

    return "Versuch es nochmal! 💪"
  }

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

  const handleRequestHelp = async (level: number) => {
    setCurrentHelpLevel(level)
    setHelpHistory([...helpHistory, level])
    setHelpLoading(true)
    setShowHelpOptions(false)

    // Lade dynamische Hilfe vom Server
    const message = await loadDynamicHelp(level)
    setHelpMessage(message)
    setHelpLoading(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border-3 border-blue-300 p-6 sm:p-8 space-y-6">
      {/* Eli Robot Status */}
      <div className="flex justify-center">
        <EliSpeaking mood="thinking" size="md" message="Lass mich dir helfen! 🤖" />
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

      {/* Help Message Display */}
      {helpMessage && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 animate-fadeIn">
          <p className="text-sm text-blue-800 font-medium">{helpMessage}</p>
        </div>
      )}

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
          <div className="space-y-2 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
            <p className="text-sm font-bold text-yellow-800 mb-3">
              {helpLoading ? "⏳ Generiere Hilfe..." : "Welche Hilfe brauchst du?"}
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleRequestHelp(1)}
                disabled={helpHistory.includes(1) || helpLoading}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 disabled:bg-gray-300 disabled:text-gray-600 p-3 rounded-lg font-bold transition-colors text-left"
              >
                💡 <span className="font-bold">Level 1: Kleiner Tipp</span>
                <br />
                <span className="text-xs">Eine kleine Anleitung</span>
              </button>
              <button
                onClick={() => handleRequestHelp(2)}
                disabled={helpHistory.includes(2) || helpLoading}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 disabled:bg-gray-300 disabled:text-gray-600 p-3 rounded-lg font-bold transition-colors text-left"
              >
                🧭 <span className="font-bold">Level 2: Richtung</span>
                <br />
                <span className="text-xs">Zeigt die richtige Richtung</span>
              </button>
              <button
                onClick={() => handleRequestHelp(3)}
                disabled={helpHistory.includes(3) || helpLoading}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 disabled:bg-gray-300 disabled:text-gray-600 p-3 rounded-lg font-bold transition-colors text-left"
              >
                📚 <span className="font-bold">Level 3: Erklärung</span>
                <br />
                <span className="text-xs">Vollständige Erklärung</span>
              </button>
            </div>
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
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 text-center">
          <p className="text-sm font-bold text-orange-800">
            📚 Hilfe verwendet: {helpHistory.map(level => `Level ${level}`).join(", ")}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Tipp: Versuche nächstes Mal ohne Hilfe! Du schaffst das! 💪
          </p>
        </div>
      )}
    </div>
  )
}
