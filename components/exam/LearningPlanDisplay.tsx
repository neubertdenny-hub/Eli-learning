"use client"

import React, { useState } from "react"
import type { GeneratedLearningPlan, DayPlan, PlanTask } from "@/lib/exam/learning-plan-generator"

interface LearningPlanDisplayProps {
  plan: GeneratedLearningPlan
  onTaskSelect?: (task: PlanTask, dayPlan: DayPlan) => void
  expandedDayNumber?: number
}

const ACTIVITY_ICONS: Record<PlanTask["activityType"], string> = {
  LEARN: "📚",
  PRACTICE: "✍️",
  TRANSFER: "🔗",
  REVIEW: "🔄",
  MINI_CHECK: "✅",
}

const ACTIVITY_LABELS: Record<PlanTask["activityType"], string> = {
  LEARN: "Lernen",
  PRACTICE: "Üben",
  TRANSFER: "Transfer",
  REVIEW: "Wiederholung",
  MINI_CHECK: "Mini-Test",
}

export function LearningPlanDisplay({
  plan,
  onTaskSelect,
  expandedDayNumber,
}: LearningPlanDisplayProps) {
  const [expanded, setExpanded] = useState<number | null>(expandedDayNumber ?? null)

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-1">📅 Dein Lernplan</h2>
            <p className="text-blue-100">Strukturiert über {plan.daysUntilExam} Tage</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{plan.totalHours}h</p>
            <p className="text-blue-100">Gesamt</p>
          </div>
        </div>

        {/* Strategy Badge */}
        <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {plan.sequenceStrategy === "weakness-first" && "💪 Schwächen zuerst"}
          {plan.sequenceStrategy === "exam-priority-first" && "🎯 Prüfungsstoff zuerst"}
          {plan.sequenceStrategy === "balanced" && "⚖️ Balanced"}
        </div>

        {/* Notes */}
        {plan.notes && (
          <div className="bg-blue-500 rounded-lg p-3 text-sm text-blue-100 whitespace-pre-line">
            {plan.notes}
          </div>
        )}

        {/* Timeline */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-400">
          <div>
            <p className="text-blue-100 text-sm">Start</p>
            <p className="font-bold">{formatDateGerman(plan.startDate)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Ende</p>
            <p className="font-bold">{formatDateGerman(plan.endDate)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Tage</p>
            <p className="font-bold">{plan.daysUntilExam}</p>
          </div>
        </div>
      </div>

      {/* Day Plans */}
      <div className="space-y-3">
        {plan.dayPlans.map(dayPlan => (
          <DayPlanCard
            key={dayPlan.dayNumber}
            dayPlan={dayPlan}
            isExpanded={expanded === dayPlan.dayNumber}
            onToggle={() => setExpanded(expanded === dayPlan.dayNumber ? null : dayPlan.dayNumber)}
            onTaskSelect={onTaskSelect}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 p-6 sm:p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">✨ Plan-Übersicht</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{plan.dayPlans.length}</p>
            <p className="text-sm text-gray-700">Tage mit Plan</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{plan.dayPlans.reduce((sum, d) => sum + d.tasks.length, 0)}</p>
            <p className="text-sm text-gray-700">Tasks total</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {Math.ceil(plan.totalHours / plan.daysUntilExam)}
            </p>
            <p className="text-sm text-gray-700">Stunden/Tag</p>
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{plan.totalHours}</p>
            <p className="text-sm text-gray-700">Stunden total</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Einzelner Tag im Plan
 */
function DayPlanCard({
  dayPlan,
  isExpanded,
  onToggle,
  onTaskSelect,
}: {
  dayPlan: DayPlan
  isExpanded: boolean
  onToggle: () => void
  onTaskSelect?: (task: PlanTask, dayPlan: DayPlan) => void
}) {
  const difficultyColor = {
    easy: "bg-green-50 border-green-200",
    medium: "bg-yellow-50 border-yellow-200",
    hard: "bg-red-50 border-red-200",
  }

  const difficultyEmoji = {
    easy: "😊",
    medium: "💪",
    hard: "🔥",
  }

  const difficultyLabel = {
    easy: "Leicht",
    medium: "Mittel",
    hard: "Anspruchsvoll",
  }

  return (
    <div className={`rounded-xl border-2 transition-all ${difficultyColor[dayPlan.difficulty]} p-4`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between hover:opacity-70 transition-opacity"
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-3">
            <h4 className="text-lg font-bold text-gray-900">
              Tag {dayPlan.dayNumber} — {formatDateGermanShort(dayPlan.date)}
            </h4>
            <span className="text-2xl">{difficultyEmoji[dayPlan.difficulty]}</span>
            <span className="text-xs bg-white px-2 py-1 rounded font-semibold text-gray-700">
              {dayPlan.tasks.length} Tasks
            </span>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 text-sm text-gray-600">
            <span>⏱️ {dayPlan.totalHours.toFixed(1)}h</span>
            <span className="hidden sm:inline">
              Topics: {new Set(dayPlan.tasks.map(t => t.topicId)).size}
            </span>
          </div>
        </div>

        <div className="text-2xl text-gray-400 ml-2">{isExpanded ? "▼" : "▶"}</div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-3 pt-4 border-t">
          {dayPlan.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              dayPlan={dayPlan}
              onClick={() => onTaskSelect?.(task, dayPlan)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Einzelne Task
 */
function TaskCard({
  task,
  dayPlan,
  onClick,
}: {
  task: PlanTask
  dayPlan: DayPlan
  onClick?: () => void
}) {
  const priorityColor = {
    1: "bg-red-100 text-red-800",
    2: "bg-yellow-100 text-yellow-800",
    3: "bg-gray-100 text-gray-800",
  }

  const priorityLabel = {
    1: "MUSS",
    2: "SOLLTE",
    3: "KANN",
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 p-3 transition-all hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {/* Activity Icon */}
        <span className="text-2xl">{ACTIVITY_ICONS[task.activityType]}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h5 className="font-bold text-gray-900">{task.topicName}</h5>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {ACTIVITY_LABELS[task.activityType]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${priorityColor[task.priority]}`}>
              {priorityLabel[task.priority]}
            </span>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.instructions}</p>

          {/* Stats */}
          <div className="flex gap-3 text-xs text-gray-500">
            <span>⏱️ {task.estimatedMinutes} min</span>
            <span>
              📊{" "}
              {task.difficulty === "easy" && "Leicht"}
              {task.difficulty === "medium" && "Mittel"}
              {task.difficulty === "hard" && "Schwer"}
            </span>
            {task.relatedTopicIds && task.relatedTopicIds.length > 0 && (
              <span>🔗 {task.relatedTopicIds.length} Kombinationen</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <span className="text-gray-400 text-lg">→</span>
      </div>
    </button>
  )
}

/**
 * Helper: Datum formatieren DD.MM.YYYY
 */
function formatDateGerman(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

/**
 * Kurz: "Mo, 15.10."
 */
function formatDateGermanShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
  const day = date.getDate()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  return `${days[date.getDay()]}, ${day}.${month}.`
}
