"use client"

import React, { useState, useRef } from "react"

interface InteractiveNumberLineProps {
  range: [number, number]
  targetValue: number
  onAnswer: (value: number, correct: boolean) => void
  title: string
  problem: string
}

export function InteractiveNumberLine({
  range,
  targetValue,
  onAnswer,
  title,
  problem,
}: InteractiveNumberLineProps) {
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const canvasRef = useRef<SVGSVGElement>(null)
  const [submitted, setSubmitted] = useState(false)

  const [min, max] = range
  const range_span = max - min

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (submitted) return

    const svg = canvasRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const clickX = e.clientX - rect.left

    // Berechne die Position auf dem Zahlenstrahl
    const svgWidth = rect.width
    const lineStartX = 60
    const lineEndX = svgWidth - 60

    if (clickX < lineStartX || clickX > lineEndX) return

    // Konvertiere Pixel-Position zu Zahl
    const percentage = (clickX - lineStartX) / (lineEndX - lineStartX)
    const value = Math.round(min + percentage * range_span)

    setSelectedPosition(value)
    setFeedback(null)
  }

  const handleSubmit = () => {
    if (selectedPosition === null) {
      setFeedback("❌ Bitte klick auf den Zahlenstrahl!")
      return
    }

    const isCorrect = selectedPosition === targetValue
    if (isCorrect) {
      setFeedback("✅ Richtig! Super!")
      setSubmitted(true)
      onAnswer(selectedPosition, true)
    } else {
      setFeedback(`❌ Nicht ganz. ${selectedPosition} ist nicht richtig. Versuch es nochmal!`)
      setSelectedPosition(null)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-6">
      {/* Aufgabe */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-lg text-gray-700">{problem}</p>
      </div>

      {/* Instruction */}
      <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg text-blue-900 font-semibold">
        👉 Klick auf die richtige Position auf dem Zahlenstrahl!
      </div>

      {/* Zahlenstrahl */}
      <div className="overflow-x-auto bg-gray-50 p-4 rounded-lg">
        <svg
          ref={canvasRef}
          width="100%"
          height="200"
          viewBox={`0 0 800 200`}
          className="cursor-pointer"
          onClick={handleCanvasClick}
        >
          {/* Hauptlinie */}
          <line x1="60" y1="100" x2="740" y2="100" stroke="#000" strokeWidth="3" />

          {/* Pfeile */}
          <polygon points="50,100 60,95 60,105" fill="#000" />
          <polygon points="750,100 740,95 740,105" fill="#000" />

          {/* Markierungen & Zahlen */}
          {Array.from({ length: Math.ceil(range_span / 5) + 1 }).map((_, i) => {
            const value = min + i * 5
            if (value > max) return null

            const percentage = (value - min) / range_span
            const x = 60 + percentage * 680

            return (
              <g key={i}>
                {/* Tickmark */}
                <line x1={x} y1="85" x2={x} y2="115" stroke="#000" strokeWidth="2" />

                {/* Zahl */}
                <text
                  x={x}
                  y="140"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#000"
                >
                  {value}
                </text>
              </g>
            )
          })}

          {/* Markiere Zielwert (versteckt aber als Hilfe angedeutet) */}
          {selectedPosition !== null && (
            <g>
              {/* Kreis an Klick-Position */}
              <circle
                cx={60 + ((selectedPosition - min) / range_span) * 680}
                cy="100"
                r="12"
                fill="red"
                opacity="0.7"
              />
              <text
                x={60 + ((selectedPosition - min) / range_span) * 680}
                y="50"
                textAnchor="middle"
                fontSize="16"
                fontWeight="bold"
                fill="red"
              >
                {selectedPosition}
              </text>
            </g>
          )}

          {/* Info-Text */}
          <text x="400" y="30" textAnchor="middle" fontSize="12" fill="#666">
            Zahlenstrahl: {min} bis {max}
          </text>
        </svg>
      </div>

      {/* Aktuelle Auswahl anzeigen */}
      {selectedPosition !== null && !submitted && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg text-center text-lg font-bold text-yellow-900">
          Du hast {selectedPosition} gewählt
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg text-center font-semibold text-lg ${
            feedback.startsWith("✅")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={selectedPosition === null || submitted}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
        >
          ✅ Antwort bestätigen
        </button>
        {submitted && (
          <button
            onClick={() => {
              setSelectedPosition(null)
              setFeedback(null)
              setSubmitted(false)
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition text-lg"
          >
            🔄 Neu
          </button>
        )}
      </div>
    </div>
  )
}
