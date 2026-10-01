"use client"

import React, { useState } from "react"
import { InteractiveNumberLine } from "./InteractiveNumberLine"

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
    const clean = answer.trim().replace(/,/g, ".").toLowerCase().replace(/°c/g, "").replace("c", "").trim()
    const expected = task.solution?.toString().replace(/,/g, ".").toLowerCase()

    // Exakte Übereinstimmung
    if (clean === expected) return true

    // Flexible Prüfung: Prüfe ob die Zahl/Wort in der solution enthalten ist
    if (expected?.includes(clean)) return true

    // Zahlen-Prüfung: z.B. "-7" in "-7°C ist kälter" oder "-7 ist kälter"
    const numberMatch = clean.match(/-?\d+\.?\d*/)?.[0]
    if (numberMatch && expected?.includes(numberMatch)) return true

    return false
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

        {/* Interaktive Zahlenstrahl-Aufgaben */}
        {task.taskData?.range && (
          <div className="py-4">
            <InteractiveNumberLine
              range={task.taskData.range}
              targetValue={task.taskData.value || parseInt(task.solution || "0")}
              title={task.title}
              problem={task.problem_statement}
              onAnswer={(value, correct) => {
                if (correct) {
                  onSubmit(value.toString(), helpLevel)
                }
              }}
            />
          </div>
        )}

        {/* Thermometer - ZEIGE ES! */}
        {task.taskType === "READ_THERMOMETER" && task.taskData?.thermometerMark !== undefined && (
          <div className="flex justify-center py-4">
            <ThermometerDisplay temp={task.taskData.thermometerMark} />
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

// Thermometer - professionell wie Lehrbuch!
function ThermometerDisplay({ temp }: { temp: number }) {
  const minTemp = -20, maxTemp = 30, range = maxTemp - minTemp
  const fillPercent = ((temp - minTemp) / range) * 100
  const allDegrees = Array.from({ length: range + 1 }, (_, i) => minTemp + i)

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 px-4">
      {/* ONE SVG mit Zahlen + Markierungen + Thermometer */}
      <svg width="280" height="480" viewBox="0 0 280 480" className="drop-shadow-lg">
        {/* Hintergrund - Thermometer Gehäuse */}
        <rect x="120" y="20" width="120" height="420" rx="30" ry="30" fill="#f5f5f5" stroke="#333" strokeWidth="3" />

        {/* Skala - LINKS INNEN */}
        {/* Alle Grad-Markierungen */}
        {allDegrees.map((degree) => {
          const y = 40 + ((30 - degree) / range) * 380
          const isMajor = degree % 10 === 0
          return (
            <g key={`tick-${degree}`}>
              {/* Markierungsstrich */}
              <line
                x1={isMajor ? 85 : 100}
                y1={y}
                x2={isMajor ? 100 : 110}
                y2={y}
                stroke={isMajor ? "#000" : "#999"}
                strokeWidth={isMajor ? 2.5 : 1}
                strokeLinecap="round"
              />

              {/* Zahlen nur bei 10er-Schritten */}
              {isMajor && (
                <text
                  x="75"
                  y={y + 6}
                  textAnchor="end"
                  fontSize="16"
                  fontWeight="bold"
                  fill="#000"
                  className="select-none"
                >
                  {degree}°
                </text>
              )}
            </g>
          )
        })}

        {/* Flüssigkeit - INNEN im Thermometer */}
        <rect
          x="130"
          y={40 + (1 - fillPercent / 100) * 380}
          width="100"
          height={fillPercent * 3.8}
          fill={temp > 15 ? "#ef4444" : temp > 0 ? "#f97316" : "#3b82f6"}
          rx="8"
        />

        {/* Glaskugel unten */}
        <circle cx="180" cy="460" r="20" fill="none" stroke="#333" strokeWidth="3" />
        <circle
          cx="180"
          cy="460"
          r="16"
          fill={temp > 15 ? "#ef4444" : temp > 0 ? "#f97316" : "#3b82f6"}
          opacity="0.6"
        />
      </svg>

      {/* Temperaturanzeige */}
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-900">{temp}°C</p>
        <p className="text-lg text-gray-600 mt-2">Lies ab!</p>
      </div>
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
