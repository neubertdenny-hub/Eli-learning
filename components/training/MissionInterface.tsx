"use client"

import React, { useState, useEffect } from "react"
import { TaskRunner, Task } from "./TaskRunner"
import { DrawingCanvas } from "./DrawingCanvas"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { RecognitionResult } from "@/lib/learning/handwriting-input"

export interface MissionInterfaceProps {
  skillName: string
  difficultyLevel: number
  onMissionComplete?: (xpEarned: number, perfectMission: boolean) => void
  onClose?: () => void
}

interface MissionTask extends Task {
  taskType: "calculation" | "conceptual" | "challenge" | "consolidation" | "victory"
}

export function MissionInterface({
  skillName,
  difficultyLevel,
  onMissionComplete,
  onClose,
}: MissionInterfaceProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [perfectStreak, setPerfectStreak] = useState(true)
  const [showDrawing, setShowDrawing] = useState(false)
  const [missionTasks, setMissionTasks] = useState<MissionTask[]>([])
  const [loading, setLoading] = useState(true)

  // Mission Struktur: 5 Tasks à 20 min
  useEffect(() => {
    const tasks: MissionTask[] = [
      {
        id: "task-1-review",
        title: `Wiederholung: ${skillName}`,
        problem_statement: `Beantworte diese Aufgabe zu ${skillName}:`,
        taskType: "calculation",
        difficulty_level: difficultyLevel - 1,
        category: "calculation",
        solution: "42",
        solution_steps: [
          {
            step_number: 1,
            description: "Schritt 1",
            explanation: "Erkläre wie du vorgehst",
            visual_hint: "Denke an die Regel...",
          },
        ],
      },
      {
        id: "task-2-favorite",
        title: `Lieblingsthema: ${skillName}`,
        problem_statement: `Eine interessante Aufgabe für dich:`,
        taskType: "conceptual",
        difficulty_level: difficultyLevel,
        category: "problem_solving",
        solution: "42",
      },
      {
        id: "task-3-challenge",
        title: `🎯 Herausforderung!`,
        problem_statement: `Das wird schwieriger! Bist du bereit?`,
        taskType: "challenge",
        difficulty_level: difficultyLevel + 1,
        category: "problem_solving",
        solution: "42",
      },
      {
        id: "task-4-consolidation",
        title: `Festigung: ${skillName}`,
        problem_statement: `Lass uns das Gelernte festigen:`,
        taskType: "consolidation",
        difficulty_level: difficultyLevel,
        category: "calculation",
        solution: "42",
      },
      {
        id: "task-5-victory",
        title: `🏆 Sieges-Runde!`,
        problem_statement: `Du schaffst das! Letzte Aufgabe:`,
        taskType: "victory",
        difficulty_level: difficultyLevel,
        category: "calculation",
        solution: "42",
      },
    ]

    setMissionTasks(tasks)
    setLoading(false)
  }, [skillName, difficultyLevel])

  const handleTaskSubmit = async (answer: string, helpLevel: number) => {
    // Berechne XP: 10-50 je Task + Multiplier
    let taskXp = 10 + (currentTaskIndex + 1) * 10
    if (helpLevel === 0) taskXp = Math.round(taskXp * 1.5) // Bonus ohne Hilfe
    if (helpLevel > 2) setPerfectStreak(false)

    setXpEarned((prev) => prev + taskXp)

    // Weiter zur nächsten Task nach kurzer Verzögerung
    setTimeout(() => {
      if (currentTaskIndex < missionTasks.length - 1) {
        setCurrentTaskIndex((prev) => prev + 1)
      } else {
        // Mission fertig!
        const totalXp = xpEarned + taskXp
        onMissionComplete?.(totalXp, perfectStreak)
      }
    }, 1500)
  }

  const handleDrawingSubmit = (result: RecognitionResult) => {
    setShowDrawing(false)
    // Prozessiere die erkannte Antwort
    if (result.confidence > 0.7) {
      handleTaskSubmit(result.recognized_text, 0)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl">⏳</div>
          <p className="text-xl font-bold text-gray-700">Mission lädt...</p>
        </div>
      </div>
    )
  }

  if (!missionTasks.length) return null

  const currentTask = missionTasks[currentTaskIndex]
  const progress = ((currentTaskIndex + 1) / missionTasks.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚀 Mission: {skillName}</h1>
            <p className="text-gray-600">
              Aufgabe {currentTaskIndex + 1} von {missionTasks.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-600">⭐ {xpEarned} XP</p>
            {perfectStreak && <p className="text-sm text-green-600">✅ Perfekt!</p>}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Eli Motivation */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-center">
        <EliSpeaking
          mood={currentTask.taskType === "challenge" ? "excited" : "explaining"}
          size="lg"
          message={`${currentTask.taskType === "challenge" ? "Das wird schwierig!" : "Du schaffst das!"} 💪`}
        />
      </div>

      {/* Task Runner */}
      <div className="max-w-4xl mx-auto mb-8">
        <TaskRunner
          task={currentTask}
          onSubmit={handleTaskSubmit}
          onCompleted={(success) => {
            if (!success) setPerfectStreak(false)
          }}
        />
      </div>

      {/* Input Method Selector */}
      <div className="max-w-4xl mx-auto flex justify-center gap-4">
        <button
          onClick={() => setShowDrawing(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          ✍️ Handschrift erkennen
        </button>
      </div>

      {/* Drawing Canvas Modal */}
      {showDrawing && <DrawingCanvas onRecognition={handleDrawingSubmit} onClose={() => setShowDrawing(false)} />}
    </div>
  )
}
