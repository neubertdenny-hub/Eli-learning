"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"

interface Task {
  id: string
  question: string
  answer: number
  type: "addition" | "subtraction" | "multiplication" | "division"
}

const TASKS: Task[] = [
  { id: "1", question: "5 + 3 = ?", answer: 8, type: "addition" },
  { id: "2", question: "12 + 8 = ?", answer: 20, type: "addition" },
  { id: "3", question: "15 - 7 = ?", answer: 8, type: "subtraction" },
  { id: "4", question: "20 - 5 = ?", answer: 15, type: "subtraction" },
  { id: "5", question: "3 × 4 = ?", answer: 12, type: "multiplication" },
  { id: "6", question: "6 × 7 = ?", answer: 42, type: "multiplication" },
  { id: "7", question: "12 ÷ 3 = ?", answer: 4, type: "division" },
  { id: "8", question: "20 ÷ 4 = ?", answer: 5, type: "division" },
]

export default function GrundrechenartenPage() {
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [completed, setCompleted] = useState(0)

  const currentTask = TASKS[currentTaskIdx]

  const handleSubmit = () => {
    const answer = parseInt(userAnswer)
    if (answer === currentTask.answer) {
      setFeedback("correct")
      setCompleted(completed + 1)
      setTimeout(() => {
        if (currentTaskIdx < TASKS.length - 1) {
          setCurrentTaskIdx(currentTaskIdx + 1)
          setUserAnswer("")
          setFeedback(null)
        }
      }, 1500)
    } else {
      setFeedback("wrong")
    }
  }

  if (currentTaskIdx >= TASKS.length) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />
        <main className="flex-1 container-full py-6 sm:py-8 space-y-8 flex flex-col items-center justify-center">
          <EliSpeaking mood="happy" size="lg" message="🎉 Super gemacht! Alle Aufgaben gelöst!" />
          <div className="bg-white rounded-2xl p-8 border-2 border-green-300 text-center space-y-4">
            <p className="text-2xl font-bold text-gray-900">{completed} / {TASKS.length} richtig!</p>
            <Link
              href="/progress"
              className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              ← Zurück zum Fortschritt
            </Link>
          </div>
        </main>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
        <div className="max-w-md mx-auto space-y-6">
          <EliSpeaking mood="thinking" size="lg" message="Lass uns rechnen! 🧮" />

          {/* Progress */}
          <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold">Aufgabe {currentTaskIdx + 1}</span>
              <span className="text-gray-600">{completed} gelöst</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${((currentTaskIdx + 1) / TASKS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Task */}
          <div className="bg-white rounded-2xl border-3 border-blue-300 p-8 space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{currentTask.question}</p>
            </div>

            {/* Input */}
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Antwort eingeben..."
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-center text-2xl font-bold focus:outline-none focus:border-blue-500"
              autoFocus
            />

            {/* Feedback */}
            {feedback === "correct" && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-green-700">✅ Richtig!</p>
              </div>
            )}

            {feedback === "wrong" && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-red-700">❌ Versuche es nochmal!</p>
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={!userAnswer || feedback !== null}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all"
            >
              Überprüfen
            </button>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
