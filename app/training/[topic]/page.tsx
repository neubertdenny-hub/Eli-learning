"use client"

import React, { useState, Suspense } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { GeometryDiagram } from "@/components/geometry/GeometryDiagram"
import {
  generateTipForAddition,
  generateTipForSubtraction,
  generateTipForMultiplication,
  generateTipForDivision
} from "@/lib/learning/tip-generator"
import { MissionCompletionCelebration } from "@/components/training/MissionCompletionCelebration"
import { ShopModal } from "@/components/shop/ShopModal"
import { ReadAloudButton } from "@/components/voice/ReadAloudButton"
import { DrawingCanvas } from "@/components/training/DrawingCanvas"
import { RecognitionResult } from "@/lib/learning/handwriting-input"
import {
  getReactionTaskCorrectIndependent,
  getReactionLevelUp,
  getReactionMissionCompleted,
} from "@/lib/gamification/eli-reactions"
import type { EliReaction } from "@/lib/gamification/eli-reactions"
import { generateNewTask } from "@/lib/learning/task-generator"

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
  const allTasks = TOPIC_TASKS[topic] || TOPIC_TASKS["bruchrechnung"]
  const topicName = TOPIC_NAMES[topic] || "Training"
  const isGeometry = topic === "geometrie"
  const [isMobile, setIsMobile] = useState(false)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [rechenwegText, setRechenwegText] = useState("")
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [completed, setCompleted] = useState(0)
  const [drawTool, setDrawTool] = useState<"pen" | "rectangle" | "circle" | "line" | "triangle">("pen")
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [showTip, setShowTip] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [rewardMessage, setRewardMessage] = useState<{ xp: number; coins: number; levelUp: boolean } | null>(null)
  const [usedHelp, setUsedHelp] = useState(false)
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<string | null>(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState<{
    xpEarned: number
    coinsEarned: number
    newLevel?: number
    badgesUnlocked?: string[]
    eliReaction: EliReaction
  } | null>(null)
  const [showShop, setShowShop] = useState(false)
  const [userRewards, setUserRewards] = useState({ xp: 0, coins: 0, level: 1 })
  const [showHandwriting, setShowHandwriting] = useState(false)
  const canvasImageRef = React.useRef<ImageData | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [tasks, setTasks] = useState<MathTask[]>(allTasks)

  // Detect mobile on mount
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Load completed tasks on mount (from localStorage for persistence)
  React.useEffect(() => {
    const userId = "test-user"
    try {
      // Try localStorage first (persists across page reloads)
      const localKey = `completed-tasks:${userId}:${topic}`
      const stored = localStorage.getItem(localKey)
      if (stored) {
        const taskIds = JSON.parse(stored)
        setCompletedTaskIds(taskIds)
        console.log(`[Completed Tasks] Loaded ${taskIds.length} from localStorage`)
        return
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }

    // Fallback: Try API (for backward compatibility)
    const loadCompletedTasks = async () => {
      try {
        const response = await fetch(
          `/api/training/completed-tasks?userId=${userId}&topic=${topic}`
        )
        const data = await response.json()
        if (data.success) {
          setCompletedTaskIds(data.completedTaskIds)
        }
      } catch (error) {
        console.error("Failed to load completed tasks from API:", error)
      }
    }
    loadCompletedTasks()
  }, [topic])

  // Filter tasks whenever completed tasks change
  React.useEffect(() => {
    // Filter: Show only NEW tasks (not already completed)
    let availableTasks = allTasks.filter(
      (t) => !completedTaskIds.includes(t.id)
    )

    // GENERATE NEW TASKS if not enough available
    if (availableTasks.length < 3) {
      const newCount = 6 - availableTasks.length
      for (let i = 0; i < newCount; i++) {
        availableTasks.push(generateNewTask(topic))
      }
    }

    setTasks(availableTasks)
    // Don't reset currentIdx - let it continue naturally
  }, [completedTaskIds, allTasks, topic])

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
    setRechenwegText("")
  }, [currentIdx])

  React.useEffect(() => {
    const userId = "test-user"

    // Load user rewards from localStorage first (fastest, most reliable)
    try {
      const stored = localStorage.getItem(`user-rewards:${userId}`)
      if (stored) {
        const rewards = JSON.parse(stored)
        setUserRewards(rewards)
        console.log("[localStorage] Loaded rewards:", rewards)
        return
      }
    } catch (error) {
      console.error("Failed to load rewards from localStorage:", error)
    }

    // Initialize shop
    const initShop = async () => {
      try {
        await fetch("/api/shop/init", { method: "POST" })
      } catch (error) {
        console.error("Failed to init shop:", error)
      }
    }

    // Load user rewards from API (fallback)
    const loadUserRewards = async () => {
      try {
        const response = await fetch(`/api/reward/user?userId=${userId}`)
        const data = await response.json()
        if (data.success) {
          const rewards = {
            xp: data.totalXp,
            coins: data.totalCoins,
            level: data.currentLevel,
          }
          setUserRewards(rewards)
          // Store in localStorage
          localStorage.setItem(`user-rewards:${userId}`, JSON.stringify(rewards))
        }
      } catch (error) {
        console.error("Failed to load user rewards:", error)
      }
    }

    initShop()
    loadUserRewards()
  }, [])

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    let clientX: number, clientY: number
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault()
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const { x, y } = getCanvasCoordinates(clientX, clientY)
    setStartPos({ x, y })
    setIsDrawing(true)

    if (drawTool === "pen") {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawTool !== "pen") return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX: number, clientY: number
    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
      e.preventDefault()
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const { x, y } = getCanvasCoordinates(clientX, clientY)

    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = "#000000"
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let clientX: number, clientY: number
    if ("touches" in e) {
      if (e.changedTouches.length === 0) {
        setIsDrawing(false)
        return
      }
      clientX = e.changedTouches[0].clientX
      clientY = e.changedTouches[0].clientY
      e.preventDefault()
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const { x, y } = getCanvasCoordinates(clientX, clientY)

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
    // Nutze die neuen Tip-Generatoren - die zeigen ANDERE Zahlen, nicht die echte Aufgabe!

    const question = task.question.toLowerCase()
    const isAddition = question.includes("+") && !question.includes("(")
    const isSubtraction = question.includes("-") && !question.includes("(")
    const isMultiplication = question.includes("*") || question.includes("×")
    const isDivision = question.includes("/") || question.includes("÷")
    const isDecimal = question.includes(",")

    // Erkenne die Aufgabengröße SELBST (nicht task.difficulty vertrauen!)
    const numbers = question.match(/\d+/g) || []
    const hasBigNumbers = numbers.some(n => parseInt(n) > 50)
    const detectedDifficulty = hasBigNumbers ? (numbers.some(n => parseInt(n) > 100) ? "schwer" : "mittel") : "einfach"

    // Nutze die neuen Generatoren mit erkannter Schwierigkeit!
    if (isAddition) {
      return generateTipForAddition(detectedDifficulty)
    }
    if (isSubtraction) {
      return generateTipForSubtraction(detectedDifficulty)
    }
    if (isMultiplication) {
      return generateTipForMultiplication(detectedDifficulty, isDecimal)
    }
    if (isDivision) {
      return generateTipForDivision()
    }

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

    // Fallback für Spezialfälle (Negative, Brüche, Gleichungen)
    const isNegative = question.includes("(") && question.includes("-")
    const isFraction = question.includes("/") && (question.includes("+") || question.includes("-"))
    const isEquation = question.includes("x") || question.includes("=")

    if (isNegative) return `➖ NEGATIVE ZAHLEN - So funktioniert's:

🎯 Das Ziel: -5 + 3 richtig berechnen

📝 SCHRITT 1: Verstehe negative Zahlen
   Eine negative Zahl ist das Gegenteil von positiv.
   -5 bedeutet: 5 Schritte nach LINKS von der 0

📝 SCHRITT 2: Stell dir eine Zahllinie vor
   ... -6 - -5 - -4 - -3 - -2 - -1 - 0 - 1 - 2 - 3 ...

📝 SCHRITT 3: Start bei der ersten Zahl
   Du fängst bei -5 an!

📝 SCHRITT 4: Addiere (gehe nach rechts)
   • Start: -5
   • +1: -4
   • +2: -3
   • +3: -2 ← FERTIG!

✅ ERGEBNIS: -5 + 3 = -2

💡 MERKSATZ: "Negative Zahlen sind links von der 0, Addieren geht nach rechts!"

⚠️ HÄUFIGER FEHLER: Vorzeichen und Zahl verwechseln!`

    if (isFraction) return `🔢 BRUCHRECHNUNG - So funktioniert's:

🎯 Das Ziel: 1/4 + 2/4 richtig berechnen

📝 SCHRITT 1: Verstehe, was ein Bruch ist
   1/4 bedeutet: 1 Stück von 4 gleich großen Stücken
   Zähler (oben) = wie viele Stücke?
   Nenner (unten) = in wie viele Stücke insgesamt?

📝 SCHRITT 2: Prüfe den Nenner
   Sind die Nenner gleich? 1/4 und 2/4 → beide haben 4!

📝 SCHRITT 3: Addiere die Zähler
   • 1 + 2 = 3

📝 SCHRITT 4: Der Nenner bleibt gleich!
   • Nenner bleibt: 4

📝 SCHRITT 5: Schreib das Ergebnis
   • 1/4 + 2/4 = 3/4

✅ ERGEBNIS: 1/4 + 2/4 = 3/4

💡 MERKSATZ: "Bei gleichen Nennern: Zähler addieren, Nenner bleibt!"`

    if (isEquation) return `📝 Gleichung lösen: x ist die unbekannte Zahl! Was muss statt x stehen? Beispiel: x + 5 = 12 → Welche Zahl + 5 = 12? Antwort: 7`

    return `💡 Tipp: Schau dir die Aufgabe genau an! Welche Rechenart? Addition (+), Subtraktion (-), Multiplikation (×) oder Division (÷)? Versuch es Schritt für Schritt!`
  }

  const handleHandwritingRecognition = (result: RecognitionResult) => {
    setRechenwegText(prev => prev + result.recognized_text + "\n")
    setShowHandwriting(false)
  }

  const handleSubmit = async () => {
    const answer = parseFloat(userAnswer)
    const expectedAnswer = typeof currentTask.answer === "number" ? currentTask.answer : parseFloat(currentTask.answer)

    if (Math.abs(answer - expectedAnswer) < 0.01) {
      setFeedback("correct")
      setCompleted(completed + 1)

      // Reward Engine: Bestimme XP-Event basierend auf Help-Nutzung
      const userId = "test-user" // TODO: aus Session holen
      const taskAttemptId = `${topic}-${currentIdx}-${Date.now()}`

      let eventType: "TASK_CORRECT_INDEPENDENT" | "TASK_CORRECT_WITH_HELP_L1_L2" | "TASK_CORRECT_WITH_HELP_L3" =
        "TASK_CORRECT_INDEPENDENT"

      if (usedHelp) {
        eventType = "TASK_CORRECT_WITH_HELP_L1_L2" // Default
      }

      try {
        // 0. Mark Task as Completed - NEUE AUFGABE GENERIEREN
        await fetch("/api/training/completed-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            topic,
            taskId: currentTask.id,
            taskQuestion: currentTask.question,
          }),
        })

        // 1. Process Reward
        const rewardRes = await fetch("/api/reward/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            eventType,
            sourceId: taskAttemptId,
          }),
        })
        const reward = await rewardRes.json()
        console.log("[Reward Response]", reward)

        // IMMEDIATELY update points in localStorage (most reliable)
        // DIRECT POINTS UPDATE - hardcode XP values
        try {
          const xpGain = 10
          const coinsGain = 1
          const newXp = (userRewards.xp || 0) + xpGain
          const newCoins = (userRewards.coins || 0) + coinsGain
          const newLevel = Math.floor(newXp / 100) + 1
          const newRewards = { xp: newXp, coins: newCoins, level: newLevel }
          setUserRewards(newRewards)
          localStorage.setItem(`user-rewards:${userId}`, JSON.stringify(newRewards))
          console.log("[Points FIXED] +10 XP +1 Coin →", newRewards)
        } catch (error) {
          console.error("[Error] Failed to update points:", error)
        }

        // ALSO fetch from API as fallback (non-blocking)
        try {
          const userRewardsRes = await fetch(`/api/reward/user?userId=${userId}`)
          const userRewardsData = await userRewardsRes.json()
          console.log("[User Rewards Response]", userRewardsData)

          if (userRewardsData.success) {
            const apiRewards = {
              xp: userRewardsData.totalXp,
              coins: userRewardsData.totalCoins,
              level: userRewardsData.currentLevel,
            }
            console.log("[Setting User Rewards from API]", apiRewards)
            setUserRewards(apiRewards)
            localStorage.setItem(`user-rewards:${userId}`, JSON.stringify(apiRewards))
          } else {
            console.error("[Error] User Rewards API failed:", userRewardsData)
          }
        } catch (rewardsError) {
          console.error("[Error] Failed to fetch user rewards:", rewardsError)
        }

        if (reward.success) {

          // Determine Eli Reaction
          let eliReaction: EliReaction
          if (reward.levelUp) {
            eliReaction = getReactionLevelUp(reward.newLevel)
          } else {
            eliReaction = getReactionTaskCorrectIndependent()
          }

          // Show Celebration
          setCelebrationData({
            xpEarned: reward.xp,
            coinsEarned: reward.coins,
            newLevel: reward.levelUp ? reward.newLevel : undefined,
            eliReaction,
          })
          setShowCelebration(true)

          setRewardMessage({
            xp: reward.xp,
            coins: reward.coins,
            levelUp: reward.levelUp,
          })
        }

        // 2. Record Learning Day (für Streaks)
        const streakRes = await fetch("/api/streak/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        const streakData = await streakRes.json()
        if (streakData.success) {
          setCurrentStreak(streakData.currentStreak)
        }

        // 3. Check Badges
        const badgeRes = await fetch("/api/badge/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        const badgeData = await badgeRes.json()
        if (badgeData.success && badgeData.newBadges.length > 0) {
          setShowBadgeUnlock(badgeData.newBadges[0])
        }
      } catch (error) {
        console.error("Gamification Error:", error)
      }

      setTimeout(() => {
        if (currentIdx < tasks.length - 1) {
          // Update completed tasks list locally AND in localStorage
          const newCompletedIds = [...completedTaskIds, currentTask.id]
          setCompletedTaskIds(newCompletedIds)

          // Persist to localStorage
          try {
            const userId = "test-user"
            const localKey = `completed-tasks:${userId}:${topic}`
            localStorage.setItem(localKey, JSON.stringify(newCompletedIds))
            console.log(`[localStorage] Saved ${newCompletedIds.length} completed tasks`)
          } catch (error) {
            console.error("Failed to save to localStorage:", error)
          }

          setCurrentIdx(currentIdx + 1)
          setUserAnswer("")
          setRechenwegText("")
          setFeedback(null)
          setShowTip(false)
          setUsedHelp(false)
          setRewardMessage(null)
          setShowLevelUp(false)
          setShowBadgeUnlock(null)
          setShowCelebration(false)
          setCelebrationData(null)
        }
      }, 1500)
    } else {
      setFeedback("wrong")

      // Phase 8 Integration: Record error & get adaptive help recommendation
      const userId = "test-user"
      try {
        fetch("/api/adaptive/record-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            topic,
            taskId: currentTask.id,
            errorType: "calculation_error",
            attemptNumber: 1 + (usedHelp ? 1 : 0),
            usedHelp,
          }),
        }).then(res => res.json()).then(data => {
          if (data.adaptiveStrategy) {
            console.log("[Adaptive] Recommended strategy:", data.adaptiveStrategy)
            // Strategy will be used when user clicks help button
          }
        })
      } catch (error) {
        console.error("[Adaptive Integration Error]", error)
      }
    }
  }

  if (currentIdx >= tasks.length) {
    const percentage = Math.round((completed / tasks.length) * 100)

    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50 pb-24 sm:pb-32">
        <Header
          userName="Zoey"
          currentLevel={userRewards.level}
          currentXP={userRewards.xp}
          maxXP={1000}
          coins={userRewards.coins}
          onShopClick={() => setShowShop(true)}
        />
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
      <Header
        userName="Zoey"
        currentLevel={userRewards.level}
        currentXP={userRewards.xp}
        maxXP={1000}
        coins={userRewards.coins}
        onShopClick={() => setShowShop(true)}
      />

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
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  {currentTask.question}
                </p>
                <ReadAloudButton
                  text={currentTask.question}
                  isMath={true}
                  label="lesen"
                  size="sm"
                />
              </div>

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

            {/* Rechenweg - Mobile Textarea / Desktop Canvas */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-base font-bold text-gray-700">📝 Rechnenweg:</label>
                {!isMobile && (
                  <button
                    onClick={clearCanvas}
                    className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-bold transition-colors"
                  >
                    🗑️ Löschen
                  </button>
                )}
              </div>

              {/* Mobile: Textarea für Rechenweg */}
              {isMobile ? (
                <div className="space-y-2">
                  <textarea
                    value={rechenwegText}
                    onChange={(e) => setRechenwegText(e.target.value)}
                    placeholder="Schreib deinen Rechenweg hier auf..."
                    className="w-full border-3 border-gray-300 rounded-lg p-4 h-32 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 resize-none text-base"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowHandwriting(true)}
                      className="flex-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold transition-colors"
                    >
                      ✍️ Mit Handschrift schreiben
                    </button>
                    <button
                      onClick={() => setRechenwegText("")}
                      className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-bold transition-colors"
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop: Geometry Tools */}
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
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                    className="w-full border-3 border-gray-400 rounded-lg bg-white cursor-crosshair shadow-md touch-none"
                  />
                </>
              )}
            </div>

            {/* Input - Prominent */}
            <div className="space-y-3 border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between items-center gap-2">
                <label className="text-base font-bold text-gray-700">✍️ Deine Antwort:</label>
                <div className="flex gap-2">
                  <ReadAloudButton
                    text={currentTask.question}
                    isMath={true}
                    label="vorlesen"
                    size="sm"
                  />
                  <button
                    onClick={() => {
                      setShowTip(!showTip)
                      if (!showTip && !usedHelp) {
                        setUsedHelp(true)
                      }
                    }}
                    className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-lg font-bold text-sm transition-colors"
                  >
                    💡 Tipp
                  </button>
                </div>
              </div>
              {showTip && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-3 border-yellow-300 shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-6 sticky top-0 flex justify-between items-center gap-3">
                      <h3 className="text-2xl font-bold text-gray-900">💡 Detaillierte Hilfe</h3>
                      <div className="flex gap-2 items-center">
                        <ReadAloudButton
                          text={getHelpfulTip(currentTask)}
                          isMath={false}
                          label="vorlesen"
                          size="sm"
                        />
                        <button
                          onClick={() => setShowTip(false)}
                          className="text-2xl text-gray-600 hover:text-gray-900 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                        <p className="text-lg font-bold text-blue-900 mb-2">📚 Die Aufgabe:</p>
                        <p className="text-2xl font-bold text-gray-900">{currentTask.question}</p>
                      </div>

                      <div className="prose prose-lg max-w-none">
                        <div className="whitespace-pre-wrap text-base text-gray-800 leading-relaxed font-medium space-y-4">
                          {getHelpfulTip(currentTask).split('\n\n').map((paragraph, idx) => (
                            <div key={idx} className={`${paragraph.includes('🎯') ? 'bg-green-50 border-2 border-green-300 p-4 rounded-lg' : paragraph.includes('✅') ? 'bg-green-100 border-2 border-green-400 p-4 rounded-lg font-bold' : paragraph.includes('💡') ? 'bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg' : ''}`}>
                              {paragraph}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100 p-6 border-t-2 border-gray-300 sticky bottom-0">
                      <button
                        onClick={() => setShowTip(false)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all"
                      >
                        ✅ Verstanden! Zurück zur Aufgabe
                      </button>
                    </div>
                  </div>
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
              <div className="bg-red-50 border-3 border-red-400 rounded-lg p-6 text-center space-y-3">
                <div className="text-5xl">❌</div>
                <p className="text-2xl font-bold text-red-700">Nicht ganz richtig!</p>
                <p className="text-base text-red-600">Schau dir die Zahlen nochmal an und versuche es erneut.</p>
                <button
                  onClick={() => {
                    setShowTip(true)
                    if (!usedHelp) {
                      setUsedHelp(true)
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-800 rounded-lg font-bold text-sm transition-colors inline-block"
                >
                  💡 Tipp anschauen
                </button>
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

      {/* Mission Completion Celebration */}
      {showCelebration && celebrationData && (
        <MissionCompletionCelebration
          show={showCelebration}
          xpEarned={celebrationData.xpEarned}
          coinsEarned={celebrationData.coinsEarned}
          newLevel={celebrationData.newLevel}
          badgesUnlocked={celebrationData.badgesUnlocked}
          eliReaction={celebrationData.eliReaction}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* Handwriting Canvas */}
      {showHandwriting && (
        <DrawingCanvas
          taskQuestion={currentTask.question}
          onRecognition={handleHandwritingRecognition}
          onClose={() => setShowHandwriting(false)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Shop Modal */}
      <ShopModal
        show={showShop}
        userId="test-user"
        userLevel={userRewards.level}
        onClose={() => setShowShop(false)}
        onEquip={() => {
          // Optional: Reload rewards after equip
        }}
      />

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
