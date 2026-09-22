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

        {/* Learning Interface Placeholder */}
        <section className="bg-white border-3 border-gray-200 rounded-2xl p-6 sm:p-8 min-h-96 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-6xl">🧠</div>
          <h3 className="text-2xl font-bold text-gray-900">Learning Engine lädt...</h3>
          <p className="text-gray-600">
            Phase 4 wird hier dieAufgaben, den Canvas und Elis Hilfe-System implementieren.
          </p>
        </section>

        {/* Info */}
        <section className="bg-yellow-50 border-3 border-yellow-400 rounded-2xl p-6">
          <p className="text-sm sm:text-base text-gray-700">
            💡 <strong>Phase 2:</strong> Dies ist ein UI-Placeholder.
            <br />
            Die vollständige Learning Engine kommt in Phase 4+.
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
