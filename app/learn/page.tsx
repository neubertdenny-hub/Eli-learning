/**
 * Learn Page
 *
 * 20-minute learning mission interface.
 * Phase 2: UI shell only
 * Phase 4+: Learning Engine implementation
 */

"use client"

import React from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
        {/* Mission Intro */}
        <section className="flex flex-col items-center text-center space-y-6">
          <EliSpeaking
            mood="explaining"
            size="md"
            message="Heute: Addieren mit negativen Zahlen 🔢"
          />

          <div className="bg-blue-100 border-3 border-blue-400 rounded-2xl p-6 sm:p-8 w-full max-w-md">
            <div className="text-5xl mb-4">⏱️</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">ca. 20 Minuten</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              Wir schauen uns 5-7 Aufgaben an und steigern die Schwierigkeit.
            </p>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors">
              🚀 Mission starten
            </button>
          </div>
        </section>

        {/* Learning Engine Status */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-400 rounded-2xl p-6 sm:p-8 min-h-96 flex flex-col items-center justify-center text-center space-y-6">
          <div className="text-6xl">✨</div>
          <div>
            <h3 className="text-3xl font-bold text-green-700 mb-2">Phase 4 LIVE! 🚀</h3>
            <p className="text-lg text-green-600 font-semibold mb-4">Learning Engine aktiv:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl text-left">
            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
              <p className="text-sm font-bold text-green-700">✅ Phase 4A</p>
              <p className="text-xs text-gray-600">Classification (A-F) + Help (0-5)</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
              <p className="text-sm font-bold text-green-700">✅ Phase 4B</p>
              <p className="text-xs text-gray-600">Foundation Gaps + Bridge Tasks</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
              <p className="text-sm font-bold text-green-700">✅ Phase 4C</p>
              <p className="text-xs text-gray-600">Mastery (0-5) + Spaced Repetition</p>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-300">
              <p className="text-sm font-bold text-green-700">✅ Phase 4D</p>
              <p className="text-xs text-gray-600">Missions + XP + Dynamic Difficulty</p>
            </div>
          </div>

          <p className="text-sm text-green-700 font-semibold">
            Klick auf "Mission starten" um zu beginnen! 👆
          </p>
        </section>

        {/* Back Button */}
        <section className="flex justify-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            <span>←</span>
            <span>Zurück zur Startseite</span>
          </Link>
        </section>
      </main>

      <Navigation />
    </div>
  )
}
