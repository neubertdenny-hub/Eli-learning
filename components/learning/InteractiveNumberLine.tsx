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

      {/* Zahlenstrahl - PROFESSIONELL */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border-2 border-indigo-200">
        <svg
          ref={canvasRef}
          width="100%"
          height="240"
          viewBox={`0 0 800 240`}
          className="cursor-pointer"
          onClick={handleCanvasClick}
        >
          {/* Hintergrund */}
          <rect width="800" height="240" fill="none" />

          {/* Hauptlinie - dick & präsent */}
          <line x1="60" y1="120" x2="740" y2="120" stroke="#1e40af" strokeWidth="5" strokeLinecap="round" />

          {/* Pfeile */}
          <polygon points="50,120 60,112 60,128" fill="#1e40af" />
          <polygon points="750,120 740,112 740,128" fill="#1e40af" />

          {/* Null-Punkt hervorheben (Referenzmitte) */}
          {min < 0 && max > 0 && (
            <g>
              <circle cx={60 + ((0 - min) / range_span) * 680} cy="120" r="8" fill="#16a34a" opacity="0.3" />
              <text x={60 + ((0 - min) / range_span) * 680} y="165" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#16a34a">
                0
              </text>
            </g>
          )}

          {/* Markierungen - ALLE Zahlen! */}
          {Array.from({ length: range_span + 1 }).map((_, i) => {
            const value = min + i
            if (value > max) return null

            const percentage = (value - min) / range_span
            const x = 60 + percentage * 680
            const isMajor = value % 5 === 0

            return (
              <g key={i}>
                {/* Tickmark - klein für alle, größer für 5er */}
                <line
                  x1={x}
                  y1={isMajor ? 105 : 115}
                  x2={x}
                  y2={isMajor ? 135 : 125}
                  stroke="#1e40af"
                  strokeWidth={isMajor ? "3" : "1.5"}
                  strokeLinecap="round"
                />

                {/* Zahl - nur für 5er-Schritte */}
                {isMajor && (
                <text
                  x={x}
                  y="190"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="bold"
                  fill="#1e40af"
                  className="select-none"
                >
                  {value}
                </text>
                )}
              </g>
            )
          })}

          {/* Markiere Zielwert - PROMINENT */}
          {selectedPosition !== null && (
            <g>
              {/* Großer Kreis für Markierung */}
              <circle
                cx={60 + ((selectedPosition - min) / range_span) * 680}
                cy="120"
                r="16"
                fill="#ef4444"
                opacity="0.8"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              />
              <circle
                cx={60 + ((selectedPosition - min) / range_span) * 680}
                cy="120"
                r="16"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              />

              {/* Zahl über Markierung */}
              <rect
                x={60 + ((selectedPosition - min) / range_span) * 680 - 25}
                y="35"
                width="50"
                height="35"
                fill="#ef4444"
                rx="6"
              />
              <text
                x={60 + ((selectedPosition - min) / range_span) * 680}
                y="65"
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fill="white"
              >
                {selectedPosition}
              </text>
            </g>
          )}

          {/* Info-Text */}
          <text x="400" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e40af">
            Zahlenstrahl: {min} bis {max}
          </text>
        </svg>

        {/* Beschreibung */}
        <p className="text-center text-sm text-gray-600 mt-4 font-medium">
          👉 Klick auf die richtige Position auf dem Zahlenstrahl!
        </p>
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
