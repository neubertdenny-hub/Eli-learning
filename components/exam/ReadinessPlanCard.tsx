"use client"

import React from "react"
import type { ExamReadinessPlan, TopicReadiness } from "@/lib/exam/readiness-engine"
import { calculateExamProgress } from "@/lib/exam/readiness-engine"
import { READINESS_STATUS_DISPLAY } from "@/lib/exam/exam-manager"

interface ReadinessPlanCardProps {
  plan: ExamReadinessPlan
  onTopicSelect?: (topic: TopicReadiness) => void
}

export function ReadinessPlanCard({ plan, onTopicSelect }: ReadinessPlanCardProps) {
  const progress = calculateExamProgress(plan)
  const status = READINESS_STATUS_DISPLAY[plan.overallReadiness]

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Deine Readiness</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {status.emoji} {status.label}
            </h3>
          </div>
          <div className="text-right space-y-1">
            <p className="text-4xl font-bold text-blue-600">{plan.readinessScore}%</p>
            <p className="text-sm text-gray-600">Mastery</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 font-semibold">Exam Readiness</span>
            <span className="text-gray-600">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Tage bis Prüfung</p>
            <p className="text-2xl font-bold text-gray-900">{plan.daysUntilExam}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Tägl. Lernzeit</p>
            <p className="text-2xl font-bold text-gray-900">{plan.recommendedSchedule.dailyHours}h</p>
          </div>
        </div>

        {/* Achievability */}
        {!plan.recommendedSchedule.isAchievable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Du brauchst {plan.recommendedSchedule.dailyHours}h/Tag. Das ist anspruchsvoll — fang früh an!
            </p>
          </div>
        )}
      </div>

      {/* Priority Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Exam Priority */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <p className="text-sm font-bold text-red-900 mb-1">🎯 Prüfungsstoff</p>
          <p className="text-3xl font-bold text-red-600">{plan.priority.examPriority.length}</p>
          <p className="text-xs text-red-700 mt-1">Direkt abgefragt</p>
        </div>

        {/* Weaknesses */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
          <p className="text-sm font-bold text-orange-900 mb-1">💪 Schwächen</p>
          <p className="text-3xl font-bold text-orange-600">{plan.priority.weaknesses.length}</p>
          <p className="text-xs text-orange-700 mt-1">Brauchen Übung</p>
        </div>

        {/* Transfer */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm font-bold text-blue-900 mb-1">🔗 Transfer</p>
          <p className="text-3xl font-bold text-blue-600">{plan.priority.transfer.length}</p>
          <p className="text-xs text-blue-700 mt-1">Kombinationen</p>
        </div>

        {/* Review */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm font-bold text-green-900 mb-1">✅ Fertig</p>
          <p className="text-3xl font-bold text-green-600">{plan.priority.review.length}</p>
          <p className="text-xs text-green-700 mt-1">Kurz wiederholen</p>
        </div>
      </div>

      {/* Recommended Schedule */}
      <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-bold text-gray-900">📅 Lernplan</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{plan.recommendedSchedule.totalRequiredHours}</p>
            <p className="text-sm text-gray-700 mt-1">Stunden total</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{plan.recommendedSchedule.dailyHours}</p>
            <p className="text-sm text-gray-700 mt-1">Stunden/Tag</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{plan.recommendedSchedule.daysToComplete}</p>
            <p className="text-sm text-gray-700 mt-1">Tage benötigt</p>
          </div>
        </div>

        {plan.recommendedSchedule.isAchievable && (
          <div className="bg-green-100 text-green-800 rounded-lg p-3 text-center font-semibold">
            ✅ Du schaffst es mit {plan.recommendedSchedule.dailyHours}h/Tag!
          </div>
        )}
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900">📚 Deine Themen</h3>

        {/* Weaknesses */}
        {plan.priority.weaknesses.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-orange-700 px-2">💪 Zuerst diese Schwächen</h4>
            {plan.priority.weaknesses.map(topic => (
              <TopicReadinessItem
                key={topic.topicId}
                topic={topic}
                onClick={() => onTopicSelect?.(topic)}
              />
            ))}
          </div>
        )}

        {/* Exam Priority */}
        {plan.priority.examPriority.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-red-700 px-2">🎯 Prüfungsstoff</h4>
            {plan.priority.examPriority.map(topic => (
              <TopicReadinessItem
                key={topic.topicId}
                topic={topic}
                onClick={() => onTopicSelect?.(topic)}
              />
            ))}
          </div>
        )}

        {/* Transfer */}
        {plan.priority.transfer.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-blue-700 px-2">🔗 Transfer-Aufgaben</h4>
            {plan.priority.transfer.map(topic => (
              <TopicReadinessItem
                key={topic.topicId}
                topic={topic}
                onClick={() => onTopicSelect?.(topic)}
              />
            ))}
          </div>
        )}

        {/* Review */}
        {plan.priority.review.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-green-700 px-2">✅ Wiederholung</h4>
            {plan.priority.review.map(topic => (
              <TopicReadinessItem
                key={topic.topicId}
                topic={topic}
                onClick={() => onTopicSelect?.(topic)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Einzelnes Topic in der Readiness-Liste
 */
function TopicReadinessItem({
  topic,
  onClick,
}: {
  topic: TopicReadiness
  onClick?: () => void
}) {
  const statusDisplay = READINESS_STATUS_DISPLAY[topic.readiness]

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 p-4 transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{statusDisplay.emoji}</span>
            <h4 className="font-bold text-gray-900">{topic.topicName}</h4>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {topic.estimatedHours}h
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${topic.mastery}%` }}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-gray-600">
            <span>Mastery: <strong className="text-gray-900">{topic.mastery}%</strong></span>
            <span>Unabhängig: <strong className="text-gray-900">{topic.independentSuccessRate}%</strong></span>
          </div>

          {/* Activities */}
          <div className="flex flex-wrap gap-1 pt-1">
            {topic.recommendedActivities.slice(0, 2).map((activity, idx) => (
              <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {activity}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right text-sm font-bold text-gray-900">
          →
        </div>
      </div>
    </button>
  )
}
