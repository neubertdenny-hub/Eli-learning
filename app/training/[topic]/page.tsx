"use client"

import React, { useState, Suspense } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { GeometryDiagram } from "@/components/geometry/GeometryDiagram"
import { getSmartTip } from "@/lib/learning/smart-tips"

interface MathTask {
  id: string
  question: string
  answer: number | string
  type: string
  difficulty: "einfach" | "mittel" | "schwer"
  geometry?: {
    shape: "rectangle" | "square" | "triangle" | "circle" | "trapez" | "cylinder"
    data: Record<string, number>
  }
}

const TOPIC_TASKS: Record<string, MathTask[]> = {
  "grundrechenarten": [
    { id: "1", question: "234 + 156 = ?", answer: 390, type: "addition", difficulty: "einfach" },
    { id: "2", question: "567 + 243 = ?", answer: 810, type: "addition", difficulty: "einfach" },
    { id: "3", question: "789 + 456 = ?", answer: 1245, type: "addition", difficulty: "mittel" },
    { id: "4", question: "1234 + 5678 = ?", answer: 6912, type: "addition", difficulty: "mittel" },
    { id: "5", question: "456 - 234 = ?", answer: 222, type: "subtraction", difficulty: "einfach" },
    { id: "6", question: "1000 - 567 = ?", answer: 433, type: "subtraction", difficulty: "schwer" },
  ],
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
    { id: "1", question: "📏 Rechteck-Challenge! Länge=5cm, Breite=3cm. Wie groß ist der Umfang?", answer: 16, type: "geometry", difficulty: "einfach", geometry: { shape: "rectangle", data: { length: 5, width: 3 } } },
    { id: "2", question: "⬛ Quadrat-Challenge! Seite=4cm. Wie groß ist die Fläche?", answer: 16, type: "geometry", difficulty: "einfach", geometry: { shape: "square", data: { side: 4 } } },
    { id: "3", question: "🔺 Dreieck-Challenge! Basis=6cm, Höhe=4cm. Wie groß ist die Fläche?", answer: 12, type: "geometry", difficulty: "mittel", geometry: { shape: "triangle", data: { base: 6, height: 4 } } },
    { id: "4", question: "⭕ Kreis-Challenge! Radius=3cm. Wie groß ist der Umfang? (π≈3,14)", answer: 18.84, type: "geometry", difficulty: "mittel", geometry: { shape: "circle", data: { radius: 3 } } },
    { id: "5", question: "🔷 Trapez-Challenge! a=5cm, b=3cm, h=4cm. Wie groß ist die Fläche?", answer: 16, type: "geometry", difficulty: "schwer", geometry: { shape: "trapez", data: { a: 5, b: 3, height: 4 } } },
    { id: "6", question: "📦 Zylinder-Challenge! Radius=2cm, Höhe=5cm. Wie groß ist das Volumen? (π≈3,14)", answer: 62.8, type: "geometry", difficulty: "schwer", geometry: { shape: "cylinder", data: { radius: 2, height: 5 } } },
  ],
}

const TOPIC_NAMES: Record<string, string> = {
  "grundrechenarten": "Grundrechenarten",
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
  const isGeometry = topic === "geometrie"

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [completed, setCompleted] = useState(0)
  const [drawTool, setDrawTool] = useState<"pen" | "rectangle" | "circle" | "line" | "triangle">("pen")
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [showTip, setShowTip] = useState(false)
  const canvasImageRef = React.useRef<ImageData | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        canvasImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
      }
    }
  }, [currentIdx])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setStartPos({ x, y })
    setIsDrawing(true)

    if (drawTool === "pen") {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawTool !== "pen") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#000000"
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineWidth = 2
    ctx.strokeStyle = "#000000"

    if (drawTool === "rectangle") {
      const w = x - startPos.x
      const h = y - startPos.y
      ctx.strokeRect(startPos.x, startPos.y, w, h)
    } else if (drawTool === "circle") {
      const r = Math.sqrt((x - startPos.x) ** 2 + (y - startPos.y) ** 2)
      ctx.beginPath()
      ctx.arc(startPos.x, startPos.y, r, 0, 2 * Math.PI)
      ctx.stroke()
    } else if (drawTool === "line") {
      ctx.beginPath()
      ctx.moveTo(startPos.x, startPos.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (drawTool === "triangle") {
      const midX = (startPos.x + x) / 2
      ctx.beginPath()
      ctx.moveTo(midX, startPos.y)
      ctx.lineTo(startPos.x, y)
      ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    }

    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        canvasImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const currentTask = tasks[currentIdx]

  const getHelpfulTip = (task: MathTask): string => {
    // Geometrie-spezifische Tipps
    if (task.type === "geometry" && task.geometry) {
      const { shape, data } = task.geometry
      if (shape === "rectangle") {
        return `📐 Denk dran: Ein Rechteck hat 4 Seiten! Du musst alle zusammenzählen! Probier es: addiere Länge + Breite, und das Ergebnis × 2! 📌 Beispiel: L=4cm, B=2cm → Das ist (4+2)×2 = 12cm. 👉 Bei dir: (${data.length}+${data.width})×2 = ?`
      } else if (shape === "square") {
        return `📐 Ein Quadrat ist einfach! Alle 4 Seiten sind GLEICH lang! Also: Seite × Seite = Fläche. 📌 Beispiel: Seite 3cm → 3×3 = 9cm². 👉 Bei dir: ${data.side}×${data.side} = ?`
      } else if (shape === "triangle") {
        return `📐 Dreieck-Trick! Man braucht Basis (unten) und Höhe (wie hoch). Dann: (Basis × Höhe) ÷ 2! 📌 Beispiel: Basis=4, Höhe=2 → (4×2)÷2 = 4cm². 👉 Bei dir: (${data.base}×${data.height})÷2 = ?`
      } else if (shape === "circle") {
        return `⭕ Kreis-Formel: Umfang = 2 × r × 3,14 (oder d × 3,14). Radius ist die Linie von Mitte bis Rand! 📌 Beispiel: r=2cm → 2×2×3,14 ≈ 12,56cm. 👉 Bei dir: 2×${data.radius}×3,14 = ?`
      }
    }

    // Smart Fallback mit Schwierigkeits-Erkennung
    const question = task.question.toLowerCase()
    const isAddition = question.includes("+") && !question.includes("(")
    const isSubtraction = question.includes("-") && !question.includes("(")
    const isMultiplication = question.includes("*") || question.includes("×")
    const isDivision = question.includes("/") || question.includes("÷")
    const isNegative = question.includes("(") && question.includes("-")
    const isFraction = question.includes("/") && (question.includes("+") || question.includes("-"))
    const isEquation = question.includes("x") || question.includes("=")
    const isDecimal = question.includes(",")

    // Extrahiere Zahlen um Schwierigkeit zu erkennen
    const numbers = question.match(/\d+/g) || []
    const hasBigNumbers = numbers.some(n => parseInt(n) > 50)
    const difficulty = task.difficulty || "einfach"

    if (isNegative) return `➖ Negative Zahlen-Trick: Positive nach rechts, negative nach links auf dem Zahlenstrahl! Beispiel: -5 + 3 = -5 dann +3 = -2. Bei dir: rechne Schritt für Schritt!`

    if (isFraction) return `🔢 Bruch-Regel: Wenn Nenner (unten) gleich, addiere/subtrahiere nur die Zähler! Der Nenner bleibt gleich! Beispiel: 1/4 + 2/4 = 3/4`

    if (isMultiplication) {
      if (isDecimal) return `✖️ Dezimal-Multiplikation: Ignoriere Kommas beim Rechnen! Beispiel: 2,5 × 2 → Rechne 25 × 2 = 50 → Dann 1 Dezimalstelle: 5,0. Schreib einfach: 5`
      if (hasBigNumbers || difficulty === "schwer") return `✖️ Multiplikation schriftlich: Multipliziere jede Ziffer einzeln, dann addiere! 📌 Beispiel: 23 × 4 → (20 × 4) + (3 × 4) = 80 + 12 = 92. Bei dir: zerlege die Zahl!`
      return `✖️ Multiplikation = wiederholte Addition! Beispiel: 3 × 4 = 4 + 4 + 4 = 12`
    }

    if (isDivision) return `➗ Division = verteilen! Beispiel: 12 ÷ 3 bedeutet: 12 in 3 Teile teilen = 4 pro Teil.`

    if (isAddition) {
      if (hasBigNumbers || difficulty === "schwer" || difficulty === "mittel") {
        return `➕ Große Addition - spaltenweise rechnen!\n📌 Schritt 1: Einer addieren (4 + 6 = 10)\n📌 Schritt 2: Zehner addieren (30 + 50 = 80)\n📌 Schritt 3: Hunderter addieren (200 + 100 = 300)\n📌 Dann alles zusammen: 10 + 80 + 300 = 390\nOder schreib untereinander und rechne spaltenweise!`
      }
      return `➕ Addition: Bei kleinen Zahlen: zähle weiter! Beispiel: 5 + 3 → zähle: 6, 7, 8. Bei großen Zahlen: spaltenweise rechnen!`
    }

    if (isSubtraction) {
      if (hasBigNumbers || difficulty === "schwer") return `➖ Große Subtraktion - spaltenweise rechnen!\n📌 Schreib die Zahlen untereinander (oben die größere!)\n📌 Rechne Einer: wenn nicht genug, "borge" von den Zehnern\n📌 Rechne Zehner und Hunderter genauso\n📌 Beispiel: 1000 - 567 = zerlege und rechne Schritt für Schritt!`
      return `➖ Subtraktion: Zähle zurück! Beispiel: 8 - 3 → zähle: 7, 6, 5 = 5`
    }

    if (isEquation) return `📝 Gleichung lösen: x ist die unbekannte Zahl! Was muss statt x stehen? Beispiel: x + 5 = 12 → Welche Zahl + 5 = 12? Antwort: 7`

    return `💡 Tipp: Schau dir die Aufgabe genau an! Welche Rechenart? Addition (+), Subtraktion (-), Multiplikation (×) oder Division (÷)? Versuch es Schritt für Schritt!`
  }

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
          setShowTip(false)
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

      <main className="flex-1 container-full py-6 sm:py-8 space-y-6">
        <div className="w-full max-w-4xl mx-auto space-y-4">
          <EliSpeaking
            mood="thinking"
            size="lg"
            message={`${topicName} üben! Level: ${currentTask.difficulty} 💪`}
          />

          {/* Progress - Compact */}
          <div className="bg-white rounded-xl border-2 border-blue-200 p-3">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-bold">{topicName}</span>
              <span className="text-gray-600">Aufgabe {currentIdx + 1}/{tasks.length}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${((currentIdx + 1) / tasks.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Task - Full Width */}
          <div className="bg-white rounded-2xl border-3 border-blue-300 p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-6">
              <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {currentTask.question}
              </p>

              {/* Geometry Diagram */}
              {isGeometry && currentTask.geometry && (
                <div className="flex justify-center py-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <GeometryDiagram
                    type={currentTask.geometry.shape}
                    data={currentTask.geometry.data}
                  />
                </div>
              )}
            </div>

            {/* Whiteboard Canvas - LARGE */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-base font-bold text-gray-700">📝 Rechnenweg:</label>
                <button
                  onClick={clearCanvas}
                  className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-bold transition-colors"
                >
                  🗑️ Löschen
                </button>
              </div>

              {/* Geometry Tools */}
              {isGeometry && (
                <div className="flex gap-2 flex-wrap justify-start">
                  <button
                    onClick={() => setDrawTool("pen")}
                    className={`px-4 py-2 text-sm rounded font-bold transition-colors ${drawTool === "pen" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                  >
                    ✏️ Stift
                  </button>
                  <button
                    onClick={() => setDrawTool("rectangle")}
                    className={`px-4 py-2 text-sm rounded font-bold transition-colors ${drawTool === "rectangle" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                  >
                    ▭ Rechteck
                  </button>
                  <button
                    onClick={() => setDrawTool("circle")}
                    className={`px-4 py-2 text-sm rounded font-bold transition-colors ${drawTool === "circle" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                  >
                    ◯ Kreis
                  </button>
                  <button
                    onClick={() => setDrawTool("line")}
                    className={`px-4 py-2 text-sm rounded font-bold transition-colors ${drawTool === "line" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                  >
                    / Linie
                  </button>
                  <button
                    onClick={() => setDrawTool("triangle")}
                    className={`px-4 py-2 text-sm rounded font-bold transition-colors ${drawTool === "triangle" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                  >
                    △ Dreieck
                  </button>
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={800}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                className="w-full border-3 border-gray-400 rounded-lg bg-white cursor-crosshair shadow-md"
              />
            </div>

            {/* Input - Prominent */}
            <div className="space-y-3 border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-base font-bold text-gray-700">✍️ Deine Antwort:</label>
                <button
                  onClick={() => setShowTip(!showTip)}
                  className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-lg font-bold text-sm transition-colors"
                >
                  💡 Tipp
                </button>
              </div>
              {showTip && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-base text-gray-800 font-medium">
                  {getHelpfulTip(currentTask)}
                </div>
              )}
              <input
                type="number"
                step="any"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Antwort eingeben..."
                className="w-full border-3 border-gray-300 rounded-lg p-4 text-center text-3xl font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
            </div>

            {/* Feedback */}
            {feedback === "correct" && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center animate-pulse">
                <p className="text-xl font-bold text-green-700">✅ Richtig!</p>
              </div>
            )}

            {feedback === "wrong" && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 text-center">
                <p className="text-lg font-bold text-red-700">❌ Versuche es nochmal!</p>
                <p className="text-base text-red-600 mt-2">{getHelpfulTip(currentTask)}</p>
              </div>
            )}

            {/* Button - Big */}
            <button
              onClick={handleSubmit}
              disabled={!userAnswer || feedback !== null}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-5 px-6 rounded-xl text-xl transition-all shadow-lg"
            >
              ✅ Überprüfen
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
