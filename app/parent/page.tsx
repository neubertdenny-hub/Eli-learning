/**
 * Parent Dashboard
 *
 * Simple PIN-protected parent view.
 * Shows learning statistics and progress reports.
 */

"use client"

import React, { useState } from "react"
import Link from "next/link"

const PARENT_PIN = "1234" // Demo PIN (to be replaced with secure auth in later phases)

export default function ParentPage() {
  const [pinEntered, setPinEntered] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPinError, setShowPinError] = useState(false)

  const handlePinSubmit = () => {
    if (pinEntered === PARENT_PIN) {
      setIsAuthenticated(true)
      setShowPinError(false)
    } else {
      setShowPinError(true)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">👨‍👩‍👧</div>
            <h1 className="text-3xl font-bold text-gray-900">Elternansicht</h1>
            <p className="text-base text-gray-600">
              Bitte gib deine PIN ein, um auf das Dashboard zuzugreifen.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border-3 border-gray-200 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                PIN (Demo: 1234)
              </label>
              <input
                type="password"
                value={pinEntered}
                onChange={(e) => setPinEntered(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePinSubmit()}
                placeholder="••••"
                className="w-full p-4 border-2 border-gray-300 rounded-lg text-center text-3xl font-bold tracking-widest focus:border-blue-600 focus:outline-none"
                maxLength={4}
              />
            </div>

            {showPinError && (
              <div className="bg-red-100 border-3 border-red-400 rounded-lg p-4 text-red-700 font-semibold">
                ❌ PIN nicht korrekt. Bitte versuche es erneut.
              </div>
            )}

            <button
              onClick={handlePinSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors"
            >
              Anmelden
            </button>

            <Link
              href="/"
              className="block text-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">📊 Eltern-Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            Abmelden
          </button>
        </div>
        <p className="text-gray-600">Zoeys Lernfortschritt und Statistiken</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8 max-w-4xl">
        {/* Weekly Stats */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border-3 border-gray-200 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Diese Woche</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>

            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600">125</div>
              <div className="text-sm text-gray-600">XP verdient</div>
            </div>

            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Aufgaben</div>
            </div>

            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-red-600">3</div>
              <div className="text-sm text-gray-600">Tage Streak 🔥</div>
            </div>
          </div>
        </section>

        {/* Topic Progress */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 border-3 border-gray-200 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Themen-Übersicht</h2>

          <div className="space-y-4">
            {[
              { name: "Bruchrechnung", status: "✅ Sicher", rate: 85 },
              { name: "Negative Zahlen", status: "⚡ Üben", rate: 60 },
              { name: "Multiplikation", status: "🆘 Schwierig", rate: 40 },
            ].map((topic, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{topic.name}</div>
                  <div className="text-sm text-gray-600">{topic.status}</div>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${topic.rate}%` }}
                  />
                </div>
                <div className="text-xs text-right text-gray-500">{topic.rate}% Erfolgsquote</div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Report Placeholder */}
        <section className="bg-blue-50 rounded-2xl p-6 sm:p-8 border-3 border-blue-200 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">📋 KI-Bericht</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <strong>Stärken:</strong>
              <p>Zoey versteht Bruchrechnung sehr gut und kann damit sicher umgehen.</p>
            </div>

            <div>
              <strong>Aktuelle Herausforderungen:</strong>
              <p>Bei negativen Zahlen und Multiplikation benötigt Zoey noch mehr Übung.</p>
            </div>

            <div>
              <strong>Empfehlung:</strong>
              <p>Regelmäßiges Üben mit negativen Zahlen wird empfohlen, um die Sicherheit zu erhöhen.</p>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            <span>←</span>
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
