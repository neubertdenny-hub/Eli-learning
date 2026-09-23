"use client"

import React, { useState, Suspense } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"

interface MathTask {
  id: string
  question: string
  answer: number | string
  type: string
  difficulty: "einfach" | "mittel" | "schwer"
}

// Aufgaben nach Thema (Klasse 7 Niveau)
const TOPIC_TASKS: Record<string, MathTask[]> = {
  "bruchrechnung": [
    { id: "1", question: "1/2 + 1/4 = ?", answer: 0.75, type: "fraction", difficulty: "einfach" },
    { id: "2", question: "3/4 + 2/8 = ?", answer: 1, type: "fraction", difficulty: "einfach" },
    { id: "3", question: "5/6 - 1/3 = ?", answer: 0.5, type: "fraction", difficulty: "mittel" },
    { id: "4", question: "2/3 × 3/4 = ?", answer: 0.5, type: "fraction", difficulty: "mittel" },
    { id: "5", question: "7/8 ÷ 1/4 = ?", answer: 3.5, type: "fraction", difficulty: "schwer" },
    { id: "6", question: "3/5 + 2/3 = ?", answer: 1.27, type: "fraction", difficulty: "schwer" },
  ],
  "negative-zahlen": [
    { id: "1", question: "-5 + 3 = ?", answer: -2, type: "negative", difficulty: "einfach" },
    { id: "2", question: "-8 + (-2) = ?", answer: -10, type: "negative", difficulty: "einfach" },
    { id: "3", question: "6 - (-4) = ?", answer: 10, type: "negative", difficulty: "mittel" },
    { id: "4", question: "-3 × (-5) = ?", answer: 15, type: "negative", difficulty: "mittel" },
    { id: "5", question: "-12 ÷ (-3) = ?", answer: 4, type: "negative", difficulty: "schwer" },
    { id: "6", question: "-2 × 3 + (-4) = ?", answer: -10, type: "negative", difficulty: "schwer" },
  ],
  "multiplikation": [
    { id: "1", question: "2,5 × 2 = ?", answer: 5, type: "decimal", difficulty: "einfach" },
    { id: "2", question: "3,4 × 3 = ?", answer: 10.2, type: "decimal", difficulty: "einfach" },
    { id: "3", question: "2,5 × 4,2 = ?", answer: 10.5, type: "decimal", difficulty: "mittel" },
    { id: "4", question: "1,5 × 2,4 = ?", answer: 3.6, type: "decimal", difficulty: "mittel" },
    { id: "5", question: "3,75 × 2,4 = ?", answer: 9, type: "decimal", difficulty: "schwer" },
    { id: "6", question: "0,5 × 0,25 × 8 = ?", answer: 1, type: "decimal", difficulty: "schwer" },
  ],
  "division": [
    { id: "1", question: "7,5 ÷ 2,5 = ?", answer: 3, type: "decimal", difficulty: "einfach" },
    { id: "2", question: "6,3 ÷ 0,9 = ?", answer: 7, type: "decimal", difficulty: "einfach" },
    { id: "3", question: "10,5 ÷ 1,5 = ?", answer: 7, type: "decimal", difficulty: "mittel" },
    { id: "4", question: "8,4 ÷ 0,7 = ?", answer: 12, type: "decimal", difficulty: "mittel" },
    { id: "5", question: "12,6 ÷ 0,42 = ?", answer: 30, type: "decimal", difficulty: "schwer" },
    { id: "6", question: "9,6 ÷ 0,32 = ?", answer: 30, type: "decimal", difficulty: "schwer" },
  ],
  "gleichungen": [
    { id: "1", question: "x + 5 = 12, x = ?", answer: 7, type: "equation", difficulty: "einfach" },
    { id: "2", question: "x - 3 = 8, x = ?", answer: 11, type: "equation", difficulty: "einfach" },
    { id: "3", question: "2x = 14, x = ?", answer: 7, type: "equation", difficulty: "mittel" },
    { id: "4", question: "3x + 2 = 11, x = ?", answer: 3, type: "equation", difficulty: "mittel" },
    { id: "5", question: "2x - 5 = 15, x = ?", answer: 10, type: "equation", difficulty: "schwer" },
    { id: "6", question: "4x + 3 = 2x + 11, x = ?", answer: 4, type: "equation", difficulty: "schwer" },
  ],
  "geometrie": [
    { id: "1", question: "Rechteck: L=5cm, B=3cm, Umfang = ?cm", answer: 16, type: "geometry", difficulty: "einfach" },
    { id: "2", question: "Quadrat: Seite=4cm, Fläche = ?cm²", answer: 16, type: "geometry", difficulty: "einfach" },
    { id: "3", question: "Dreieck: Basis=6cm, Höhe=4cm, Fläche = ?cm²", answer: 12, type: "geometry", difficulty: "mittel" },
    { id: "4", question: "Kreis: r=3cm, Umfang ≈ ?cm (π≈3,14)", answer: 18.84, type: "geometry", difficulty: "mittel" },
    { id: "5", question: "Trapez: a=5cm, b=3cm, h=4cm, Fläche = ?cm²", answer: 16, type: "geometry", difficulty: "schwer" },
    { id: "6", question: "Zylinder: r=2cm, h=5cm, Volumen ≈ ?cm³ (π≈3,14)", answer: 62.8, type: "geometry", difficulty: "schwer" },
  ],
}

const TOPIC_NAMES: Record<string, string> = {
  "bruchrechnung": "Bruchrechnung",
  "negative-zahlen": "Negative Zahlen",
  "multiplikation": "Multiplikation",
  "division": "Division",
  "gleichungen": "Gleichungen",
  "geometrie": "Geometrie",
}

function TrainingContent() {
  const params = useParams()
  const topic = (params?.topic as string) || "bruchrechnung"
  const tasks = TOPIC_TASKS[topic] || TOPIC_TASKS["bruchrechnung"]
  const topicName = TOPIC_NAMES[topic] || "Training"

  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [completed, setCompleted] = useState(0)

  const currentTask = tasks[currentIdx]

  const handleSubmit = () => {
    const answer = parseFloat(userAnswer)
    const expectedAnswer = typeof currentTask.answer === "number" ? currentTask.answer : parseFloat(currentTask.answer)

    if (Math.abs(answer - expectedAnswer) < 0.01) {
      setFeedback("correct")
      setCompleted(completed + 1)
      setTimeout(() => {
        if (currentIdx < tasks.length - 1) {
          setCurrentIdx(currentIdx + 1)
          setUserAnswer("")
          setFeedback(null)
        }
      }, 1500)
    } else {
      setFeedback("wrong")
    }
  }

  if (currentIdx >= tasks.length) {
    const percentage = Math.round((completed / tasks.length) * 100)

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />
        <main className="flex-1 container-full py-6 sm:py-8 space-y-8 flex flex-col items-center justify-center">
          <EliSpeaking
            mood="happy"
            size="lg"
            message={percentage === 100 ? "🌟 Perfekt gelöst!" : "🎉 Sehr gut gemacht!"}
          />
          <div className="bg-white rounded-2xl p-8 border-2 border-green-300 text-center space-y-4 max-w-md">
            <p className="text-4xl font-bold text-green-600">{percentage}%</p>
            <p className="text-xl font-bold text-gray-900">{completed} / {tasks.length} richtig</p>
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
        <div className="max-w-2xl mx-auto space-y-6">
          <EliSpeaking
            mood="thinking"
            size="lg"
            message={`${topicName} üben! Level: ${currentTask.difficulty} 💪`}
          />

          {/* Progress */}
          <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold">{topicName}</span>
              <span className="text-gray-600">Aufgabe {currentIdx + 1}/{tasks.length}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${((currentIdx + 1) / tasks.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2 text-gray-600">
              <span>Schwierigkeit: {currentTask.difficulty}</span>
              <span>{completed} gelöst</span>
            </div>
          </div>

          {/* Task */}
          <div className="bg-white rounded-2xl border-3 border-blue-300 p-8 space-y-6">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 leading-relaxed">
                {currentTask.question}
              </p>
            </div>

            {/* Input */}
            <input
              type="number"
              step="any"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Antwort eingeben..."
              className="w-full border-2 border-gray-300 rounded-lg p-4 text-center text-2xl font-bold focus:outline-none focus:border-blue-500"
              autoFocus
            />

            {/* Feedback */}
            {feedback === "correct" && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center animate-pulse">
                <p className="text-lg font-bold text-green-700">✅ Richtig!</p>
              </div>
            )}

            {feedback === "wrong" && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-red-700">❌ Versuche es nochmal!</p>
                <p className="text-sm text-red-600 mt-2">Tipp: Die Antwort ist {currentTask.answer}</p>
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

export default function TrainingPage() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <TrainingContent />
    </Suspense>
  )
}
