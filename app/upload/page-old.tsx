/**
 * Upload Page
 *
 * Photo upload interface for new math topics.
 * Phase 2: UI shell only
 * Phase 3+: OpenAI image analysis
 */

"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
        {/* Intro */}
        <section className="flex flex-col items-center text-center space-y-6">
          <EliSpeaking
            mood="encouraging"
            size="md"
            message="Zeige mir, was du lernen möchtest! 📚"
          />
        </section>

        {/* Upload Zone */}
        <section
          className={`w-full p-8 sm:p-12 rounded-2xl border-3 border-dashed transition-colors ${
            dragActive
              ? "border-purple-600 bg-purple-100"
              : "border-purple-400 bg-purple-50 hover:border-purple-600"
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDrop={() => setDragActive(false)}
        >
          <div className="text-center space-y-4">
            <div className="text-6xl sm:text-7xl">📸</div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Foto hochladen
            </h2>

            <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
              Fotografiere dein Mathebuch, Schulheft oder Arbeitsblatt.
              Eli analysiert das Bild und erstellt daraus eine Mission für dich.
            </p>

            <div className="flex flex-col gap-3 pt-6">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors touch-target">
                📷 Mit Kamera aufnehmen
              </button>

              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors touch-target">
                📁 Aus Galerie wählen
              </button>
            </div>

            <p className="text-sm text-gray-500 pt-4">
              oder drag &amp; drop ein Bild hier hin
            </p>
          </div>
        </section>

        {/* Info */}
        <section className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Hilfreiche Tipps:</h3>

          <div className="space-y-3">
            {[
              "✅ Gute Beleuchtung – das Foto sollte hell und scharf sein",
              "✅ Gesamtansicht – zeige die ganze Aufgabe oder Seite",
              "✅ Gerade halten – halte die Kamera senkrecht zum Papier",
              "✅ Lesbar – der Text muss lesbar sein",
            ].map((tip, idx) => (
              <div key={idx} className="text-base sm:text-lg text-gray-700">
                {tip}
              </div>
            ))}
          </div>
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
