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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-blue-50 pb-24">
      <Header userName="Eltern" currentLevel={1} currentXP={0} maxXP={100} />

      <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
        <section className="bg-gradient-to-r from-purple-100 to-pink-100 border-3 border-purple-400 rounded-2xl p-8 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">👨‍👩‍👧</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eltern-Bericht</h1>
              <p className="text-gray-600">Wöchentlicher Fortschritt von {dashboard.student_name}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
            <p className="text-lg text-gray-800">{parentReport.summary}</p>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border-3 border-green-300 p-6 text-center">
            <p className="text-sm font-bold text-green-600">Gesamt XP</p>
            <p className="text-4xl font-bold text-green-900">{parentReport.key_metrics.total_xp}</p>
          </div>
          <div className="bg-white rounded-2xl border-3 border-blue-300 p-6 text-center">
            <p className="text-sm font-bold text-blue-600">Level</p>
            <p className="text-4xl font-bold text-blue-900">{parentReport.key_metrics.level}</p>
          </div>
          <div className="bg-white rounded-2xl border-3 border-purple-300 p-6 text-center">
            <p className="text-sm font-bold text-purple-600">Mastery</p>
            <p className="text-4xl font-bold text-purple-900">{parentReport.key_metrics.mastery_score}%</p>
          </div>
          <div className="bg-white rounded-2xl border-3 border-yellow-300 p-6 text-center">
            <p className="text-sm font-bold text-yellow-600">Konsistenz</p>
            <p className="text-4xl font-bold text-yellow-900">{parentReport.key_metrics.consistency_score}%</p>
          </div>
        </section>

        <section className="bg-white border-3 border-green-300 rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">🎉 Erfolge</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parentReport.highlights.map((highlight: string, i: number) => (
              <div key={i} className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <p className="text-green-800 font-medium">{highlight}</p>
              </div>
            ))}
          </div>
        </section>

        {parentReport.areas_for_support.length > 0 && (
          <section className="bg-white border-3 border-orange-300 rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">💡 Unterstützungsbereiche</h2>
            <div className="space-y-3">
              {parentReport.areas_for_support.map((area: string, i: number) => (
                <div key={i} className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <p className="text-orange-800 font-medium">{area}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border-3 border-blue-300 rounded-2xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">📋 Empfehlungen</h2>
          <div className="space-y-3">
            {parentReport.recommendations.map((rec: string, i: number) => (
              <div key={i} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-blue-800 font-medium">• {rec}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex justify-center gap-4">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            <span>←</span>
            <span>Zurück</span>
          </Link>
        </section>
      </main>

      <Navigation />
    </div>
  )
}
