/**
 * Learn Page
 *
 * 20-minute learning mission interface.
 * Phase 2: UI shell only
 * Phase 4+: Learning Engine implementation
 */

"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { MissionInterface } from "@/components/training/MissionInterface"

export default function LearnPage() {
  const [missionStarted, setMissionStarted] = useState(false)

  if (missionStarted) {
    return (
      <MissionInterface
        skillName="Addieren mit negativen Zahlen"
        difficultyLevel={2}
        onMissionComplete={(xpEarned, perfectMission) => {
          alert(`🎉 Mission fertig! ${xpEarned} XP ${perfectMission ? "✅ Perfect!" : ""}`)
          setMissionStarted(false)
        }}
        onClose={() => setMissionStarted(false)}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 w-full py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Welcome Section */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">Lernmission</h1>
            <p className="text-gray-600 text-lg">Bereite dich vor für eine intensive 20-Minuten Übung</p>
          </div>

          {/* Eli & Mission Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Eli Robot */}
            <div className="lg:col-span-1 flex justify-center">
              <EliSpeaking
                mood="explaining"
                size="lg"
                message="Los gehts! 🚀"
              />
            </div>

            {/* Mission Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-gray-200">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Addieren mit negativen Zahlen
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  In dieser Mission trainierst du mit 5 Aufgaben. Wir starten einfach und steigern die Schwierigkeit
                  Step-by-Step. Nutze Hilfe wenn nötig – es ist zum Lernen da! 💪
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold mb-1">⏱️ Dauer</p>
                    <p className="text-2xl font-bold text-blue-900">~20 Min</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold mb-1">⭐ Zu verdienen</p>
                    <p className="text-2xl font-bold text-purple-900">50-100 XP</p>
                  </div>
                </div>

                <button
                  onClick={() => setMissionStarted(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
                >
                  🚀 Mission starten
                </button>
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Das wirst du trainieren</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { emoji: "📚", title: "Wiederholung", desc: "Festigung der Grundlagen" },
                { emoji: "💪", title: "Übung", desc: "Kern-Fähigkeiten trainieren" },
                { emoji: "🎯", title: "Herausforderung", desc: "Dein Können erweitern" },
                { emoji: "🏆", title: "Finale", desc: "Alles zusammen anwenden" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all hover:border-indigo-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{item.emoji}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-3xl p-8 sm:p-10 border border-green-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">✨</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Du bist nicht allein!</h3>
                <p className="text-gray-600 mt-2">Eli hilft dir auf drei verschiedenen Levels:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <p className="font-bold text-yellow-600 mb-1">💡 Level 1</p>
                <p className="text-sm text-gray-700">Kleiner Tipp</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <p className="font-bold text-yellow-600 mb-1">🧭 Level 2</p>
                <p className="text-sm text-gray-700">Richtung zeigen</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <p className="font-bold text-yellow-600 mb-1">📚 Level 3</p>
                <p className="text-sm text-gray-700">Vollständige Erklärung</p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="flex justify-center pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <span>←</span>
              <span>Zurück zur Startseite</span>
            </Link>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
