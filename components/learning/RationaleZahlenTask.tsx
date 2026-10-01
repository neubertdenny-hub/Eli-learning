"use client"

import React, { useState } from "react"

interface RationaleZahlenTaskProps {
  task: any
  onSubmit: (answer: string, helpLevel: number) => void
}

export function RationaleZahlenTask({ task, onSubmit }: RationaleZahlenTaskProps) {
  const [userAnswer, setUserAnswer] = useState("")
  const [helpLevel, setHelpLevel] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      setFeedback("Bitte antworte zuerst!")
      return
    }

    const correct = validateAnswer(userAnswer, task)
    if (correct) {
      setFeedback("✅ Richtig! Sehr gut!")
      setTimeout(() => onSubmit(userAnswer, helpLevel), 1000)
    } else {
      setFeedback("❌ Noch nicht richtig. Versuch es nochmal!")
    }
  }

  const validateAnswer = (answer: string, task: any): boolean => {
    const clean = answer.trim().replace(/,/g, ".").toLowerCase()
    const expected = task.solution?.toString().replace(/,/g, ".").toLowerCase()
    return clean === expected
  }

  const getTip = (level: number) => {
    const tipMap: Record<number, string> = {
      1: task.taskData?.hint1 || "Tipp: Lies die Aufgabe genau durch!",
      2: task.taskData?.hint2 || "Tipp: Negative Zahlen sind KLEINER als positive!",
      3: task.taskData?.hint3 || "Tipp: Die Lösung ist: " + task.solution,
    }
    return tipMap[level] || ""
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-6">
      {/* Aufgabe */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
        <p className="text-lg text-gray-700">{task.problem_statement}</p>

        {/* Visuelle Hilfen für spezielle Task-Typen */}
        {task.taskType === "READ_THERMOMETER" && task.taskData?.thermometer && (
          <div className="flex justify-center py-4">
            <ThermometerDisplay temp={task.taskData.thermometerMark} />
          </div>
        )}

        {task.taskType === "PLACE_ON_NUMBER_LINE" && task.taskData?.range && (
          <div className="flex justify-center py-4">
            <NumberLineDisplay range={task.taskData.range} highlightValue={task.taskData.value} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Deine Antwort:</label>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="z.B. 6°C oder -9 oder -89,2"
          className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 text-lg"
        />
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg text-center font-semibold ${
            feedback.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Tipps */}
      {helpLevel < 3 && (
        <div className="space-y-2">
          <button
            onClick={() => setHelpLevel(helpLevel + 1)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            💡 Tipp {helpLevel + 1}
          </button>
          {helpLevel > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg text-gray-800">
              {getTip(helpLevel)}
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
      >
        ✅ Antwort überprüfen
      </button>
    </div>
  )
}

// Thermometer Visualisierung
function ThermometerDisplay({ temp }: { temp: number }) {
  const scale = (temp + 100) / 2 // Skalierung von -100 bis 100 auf 0 bis 100
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-48 border-2 border-gray-800 rounded-full relative bg-gradient-to-t from-red-200 to-blue-200">
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full bg-red-400 rounded-full transition-all"
          style={{ height: `${scale}%` }}
        />
        <span className="absolute -right-12 top-1/2 transform -translate-y-1/2 font-bold text-gray-800">
          {temp}°C
        </span>
      </div>
      <p className="text-sm text-gray-600">Liest die Temperatur ab!</p>
    </div>
  )
}

// Zahlenstrahl Visualisierung
function NumberLineDisplay({
  range,
  highlightValue,
}: {
  range: [number, number]
  highlightValue?: number
}) {
  const [min, max] = range
  const width = max - min
  const steps = Math.ceil(width / 5) * 5

  return (
    <div className="w-full px-4 py-6 bg-gray-50 rounded-lg">
      <div className="relative h-12">
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Linie */}
          <line x1="20" y1="30" x2="calc(100% - 20px)" y2="30" stroke="black" strokeWidth="2" />

          {/* Markierungen */}
          {Array.from({ length: steps + 1 }).map((_, i) => {
            const value = min + (i / steps) * width
            const x = 20 + ((value - min) / width) * (100 - 4) + "%"
            return (
              <g key={i}>
                <line x1={x} y1="20" x2={x} y2="40" stroke="black" strokeWidth="1" />
                <text x={x} y="55" textAnchor="middle" fontSize="12">
                  {Math.round(value)}
                </text>
              </g>
            )
          })}

          {/* Markiere gesuchten Wert */}
          {highlightValue !== undefined && (
            <circle
              cx={`calc(20% + ${((highlightValue - min) / width) * 80}%)`}
              cy="30"
              r="8"
              fill="red"
              opacity="0.5"
            />
          )}
        </svg>
      </div>
      <p className="text-sm text-gray-600 mt-4">Wo liegt die Zahl auf dem Zahlenstrahl?</p>
    </div>
  )
}
