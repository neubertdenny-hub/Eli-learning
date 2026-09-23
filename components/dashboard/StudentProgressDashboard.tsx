"use client"

import React from "react"
import {
  StudentDashboard,
  generateStudentDashboard,
  generateParentReport,
} from "@/lib/learning/dashboard-analytics"
import { SkillMastery } from "@/lib/learning/mastery-engine"
import { XPSystem } from "@/lib/learning/mission-system"

export interface StudentProgressDashboardProps {
  studentName: string
  skills: SkillMastery[]
  xpSystem: XPSystem
  periodData: {
    this_week_missions: number
    this_week_xp: number
    this_month_missions: number
    this_month_xp: number
    this_month_hours: number
  }
}

export function StudentProgressDashboard({
  studentName,
  skills,
  xpSystem,
  periodData,
}: StudentProgressDashboardProps) {
  const dashboard = generateStudentDashboard(studentName, skills, xpSystem, [], periodData)
  const parentReport = generateParentReport(studentName, dashboard, "weekly")

  return (
    <div className="space-y-8 py-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 border-3 border-purple-300 rounded-2xl p-6">
          <p className="text-sm font-bold text-purple-600">📊 LEVEL</p>
          <p className="text-4xl font-bold text-purple-900">{dashboard.current_level}</p>
          <p className="text-xs text-purple-600 mt-2">{dashboard.current_xp}/500 XP</p>
        </div>

        {/* Mastery Card */}
        <div className="bg-gradient-to-br from-green-100 to-green-50 border-3 border-green-300 rounded-2xl p-6">
          <p className="text-sm font-bold text-green-600">✅ MASTERY</p>
          <p className="text-4xl font-bold text-green-900">
            {Math.round((dashboard.mastery_overview.average_mastery / 5) * 100)}%
          </p>
          <p className="text-xs text-green-600 mt-2">Ø {dashboard.mastery_overview.skills_mastered_5} Skills</p>
        </div>

        {/* Streak Card */}
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-3 border-yellow-300 rounded-2xl p-6">
          <p className="text-sm font-bold text-yellow-600">🔥 STREAK</p>
          <p className="text-4xl font-bold text-yellow-900">{dashboard.streak_info.current_days}d</p>
          <p className="text-xs text-yellow-600 mt-2">Best: {dashboard.streak_info.longest_days}d</p>
        </div>

        {/* Consistency Card */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-3 border-blue-300 rounded-2xl p-6">
          <p className="text-sm font-bold text-blue-600">📈 KONSISTENZ</p>
          <p className="text-4xl font-bold text-blue-900">
            {Math.round(dashboard.this_month.consistency_percentage)}%
          </p>
          <p className="text-xs text-blue-600 mt-2">{dashboard.this_week.missions_completed} Missionen</p>
        </div>
      </div>

      {/* Mastery Overview */}
      <div className="bg-white border-3 border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900">🎯 Skill Status</h3>
        <div className="grid grid-cols-5 gap-3 text-center text-sm">
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
            <p className="font-bold text-green-700">{dashboard.mastery_overview.skills_mastered_5}</p>
            <p className="text-xs text-green-600">Gemeistert (Level 5)</p>
          </div>
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
            <p className="font-bold text-blue-700">{dashboard.mastery_overview.skills_expert_4}</p>
            <p className="text-xs text-blue-600">Experte (Level 4)</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3">
            <p className="font-bold text-purple-700">{dashboard.mastery_overview.skills_fluent_3}</p>
            <p className="text-xs text-purple-600">Fließend (Level 3)</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
            <p className="font-bold text-yellow-700">{dashboard.mastery_overview.skills_learning}</p>
            <p className="text-xs text-yellow-600">Lernend (Level 1-2)</p>
          </div>
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
            <p className="font-bold text-gray-700">{dashboard.mastery_overview.skills_not_started}</p>
            <p className="text-xs text-gray-600">Nicht begonnen</p>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* This Week */}
        <div className="bg-white border-3 border-blue-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">📅 Diese Woche</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Missionen:</span>
              <span className="font-bold text-blue-600">{dashboard.this_week.missions_completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">XP verdient:</span>
              <span className="font-bold text-yellow-600">{dashboard.this_week.xp_earned} ⭐</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Zeit verbracht:</span>
              <span className="font-bold text-purple-600">{dashboard.this_week.time_spent_hours.toFixed(1)}h</span>
            </div>
            {dashboard.this_week.new_skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Neue Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {dashboard.this_week.new_skills.map((skill) => (
                    <span key={skill} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white border-3 border-purple-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">📆 Dieser Monat</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Missionen:</span>
              <span className="font-bold text-purple-600">{dashboard.this_month.missions_completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">XP verdient:</span>
              <span className="font-bold text-yellow-600">{dashboard.this_month.xp_earned} ⭐</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lernstunden:</span>
              <span className="font-bold text-green-600">{dashboard.this_month.learning_hours}h</span>
            </div>
            {dashboard.this_month.skills_mastered.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Gemeisterte Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {dashboard.this_month.skills_mastered.map((skill) => (
                    <span key={skill} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                      ✅ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      {dashboard.focus_areas.length > 0 && (
        <div className="bg-white border-3 border-orange-200 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">🎯 Fokus-Bereiche</h3>
          <div className="space-y-3">
            {dashboard.focus_areas.map((area) => (
              <div key={area.skill_name} className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-gray-900">{area.skill_name}</p>
                  <p className="text-sm text-orange-600">Level {area.current_level}</p>
                </div>
                <p className="text-sm text-gray-600 mb-2">{area.recommended_action}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${(area.current_level / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parent Report Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-3 border-purple-300 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">👨‍👩‍👧 Eltern-Bericht</h3>
        <p className="text-gray-700 leading-relaxed">{parentReport.summary}</p>
        <div className="grid grid-cols-2 gap-4">
          {parentReport.highlights.map((highlight, i) => (
            <div key={i} className="bg-white rounded-lg p-3 text-sm font-medium text-gray-800">
              {highlight}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
