/**
 * Training Page
 *
 * Load training exercises for a specific topic.
 * Redirects to upload or shows available exercises.
 */

"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"

function TrainContent() {
  const searchParams = useSearchParams()
  const topic = searchParams?.get("topic") || "unknown"

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
        <section className="flex flex-col items-center text-center space-y-6">
          <EliSpeaking
            mood="happy"
            size="lg"
            message={`Lass uns ${topic} trainieren! 💪`}
          />

          <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 space-y-4 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900">
              Training für: <span className="capitalize">{topic}</span>
            </h2>

            <p className="text-gray-600">
              Du kannst entweder eigene Materialien hochladen oder aus vordefinierten Aufgaben wählen.
            </p>

            <div className="space-y-3 pt-4">
              <Link
                href="/upload"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all"
              >
                📸 Material hochladen
              </Link>

              <Link
                href="/progress"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
              >
                ← Zurück zum Fortschritt
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  )
}

export default function TrainPage() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <TrainContent />
    </Suspense>
  )
}
