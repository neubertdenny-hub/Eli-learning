"use client"

import React from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { generateStudentDashboard, generateParentReport } from "@/lib/learning/dashboard-analytics"

const mockSkills = [
  {
    skill_name: "Addieren mit negativen Zahlen",
    current_level: 3,
    attempts: 8,
    correct_attempts: 6,
    time_spent_minutes: 45,
    last_practiced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    next_review: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const mockXPSystem = {
  total_xp: 450,
  current_level: 1,
  current_streak_missions: 7,
  best_streak_missions: 14,
}

const mockPeriodData = {
  this_week_missions: 5,
  this_week_xp: 250,
  this_month_missions: 18,
  this_month_xp: 900,
  this_month_hours: 12,
}

export default function ParentDashboard() {
  const dashboard = generateStudentDashboard(
    "Zoey",
    mockSkills as any,
    mockXPSystem as any,
    [],
    mockPeriodData
  )

  const parentReport = generateParentReport("Zoey", dashboard, "weekly")

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24">
      <Header userName="Eltern" currentLevel={1} currentXP={0} maxXP={100} showParentAccess={false} />

      <main className="flex-1 w-full py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Welcome Section */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              Fortschritt von {dashboard.student_name}
            </h1>
            <p className="text-gray-600 text-lg">Detaillierte Wochenanalyse und Empfehlungen</p>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-10 text-white shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Wöchentliche Zusammenfassung</h2>
                <p className="opacity-90">Woche vom {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("de-DE")}</p>
              </div>
              <div className="text-5xl">📊</div>
            </div>
            <p className="text-base sm:text-lg leading-relaxed font-medium">{parentReport.summary}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* XP */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {parentReport.key_metrics.total_xp}
                </div>
                <div className="text-3xl">⭐</div>
              </div>
              <p className="text-gray-600 font-medium">Gesamt XP</p>
              <p className="text-xs text-gray-500 mt-2">
                {parentReport.key_metrics.total_xp > 400 ? "Ausgezeichnet! 🌟" : "Guter Fortschritt"}
              </p>
            </div>

            {/* Level */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {parentReport.key_metrics.level}
                </div>
                <div className="text-3xl">🏆</div>
              </div>
              <p className="text-gray-600 font-medium">Aktuelles Level</p>
              <p className="text-xs text-gray-500 mt-2">Level {parentReport.key_metrics.level + 1} kommt bald</p>
            </div>

            {/* Mastery */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {parentReport.key_metrics.mastery_score}%
                </div>
                <div className="text-3xl">📈</div>
              </div>
              <p className="text-gray-600 font-medium">Beherrschung</p>
              <p className="text-xs text-gray-500 mt-2">
                {parentReport.key_metrics.mastery_score >= 70 ? "Starke Beherrschung" : "In Arbeit"}
              </p>
            </div>

            {/* Konsistenz */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {parentReport.key_metrics.consistency_score}%
                </div>
                <div className="text-3xl">🔥</div>
              </div>
              <p className="text-gray-600 font-medium">Konsistenz</p>
              <p className="text-xs text-gray-500 mt-2">
                {parentReport.key_metrics.consistency_score >= 80 ? "Regelmäßig trainierend" : "Zu verbessern"}
              </p>
            </div>
          </div>

          {/* Erfolge */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Erfolge dieser Woche</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {parentReport.highlights.map((highlight: string, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-green-200/50 hover:border-green-300 hover:shadow-md transition-all"
                >
                  <p className="text-gray-900 font-semibold">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Unterstützungsbereiche */}
          {parentReport.areas_for_support.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">💡</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Unterstützungsbereiche</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parentReport.areas_for_support.map((area: string, i: number) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-amber-200/50 hover:border-amber-300 hover:shadow-md transition-all"
                  >
                    <p className="text-gray-900 font-semibold">{area}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empfehlungen */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📋</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Empfehlungen für nächste Woche</h2>
            </div>
            <div className="space-y-3">
              {parentReport.recommendations.map((rec: string, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-blue-200/50 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <p className="text-gray-900 font-semibold leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <span>←</span>
              <span>Zurück zu Zoey's Fortschritt</span>
            </Link>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
