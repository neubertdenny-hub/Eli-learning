/**
 * Progress Page
 *
 * Shows Zoey's learning progress across all topics.
 * Displays mastery status (GREEN/YELLOW/RED) for each topic.
 */

"use client"

import React from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { TopicGrid } from "@/components/task/TopicCard"

export default function ProgressPage() {
  const allTopics = [
    {
      title: "Bruchrechnung",
      emoji: "🍰",
      status: "green" as const,
      successRate: 85,
      lastPracticed: "Heute",
      href: "/train?topic=bruchrechnung",
    },
    {
      title: "Negative Zahlen",
      emoji: "❄️",
      status: "yellow" as const,
      successRate: 60,
      lastPracticed: "Gestern",
      href: "/train?topic=negative-zahlen",
    },
    {
      title: "Multiplikation",
      emoji: "✖️",
      status: "red" as const,
      successRate: 40,
      lastPracticed: "Vor 3 Tagen",
      href: "/train?topic=multiplikation",
    },
    {
      title: "Division",
      emoji: "➗",
      status: "green" as const,
      successRate: 78,
      lastPracticed: "Vor 1 Woche",
      href: "/train?topic=division",
    },
    {
      title: "Gleichungen",
      emoji: "⚖️",
      status: "yellow" as const,
      successRate: 55,
      lastPracticed: "Vor 2 Tagen",
      href: "/train?topic=gleichungen",
    },
    {
      title: "Geometrie",
      emoji: "📐",
      status: "new" as const,
      href: "/train?topic=geometrie",
    },
  ]

  const stats = {
    totalTopics: allTopics.length,
    greenTopics: allTopics.filter((t) => t.status === "green").length,
    yellowTopics: allTopics.filter((t) => t.status === "yellow").length,
    redTopics: allTopics.filter((t) => t.status === "red").length,
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-green-50 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
        {/* Overview */}
        <section>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Dein Fortschritt</h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border-3 border-gray-200 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats.totalTopics}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Themen</div>
            </div>

            <div className="bg-green-100 border-3 border-green-400 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">✅</div>
              <div className="text-xs sm:text-sm text-gray-600">{stats.greenTopics} Sicher</div>
            </div>

            <div className="bg-yellow-100 border-3 border-yellow-400 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600">⚡</div>
              <div className="text-xs sm:text-sm text-gray-600">{stats.yellowTopics} Üben</div>
            </div>

            <div className="bg-red-100 border-3 border-red-400 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">🆘</div>
              <div className="text-xs sm:text-sm text-gray-600">{stats.redTopics} Schwierig</div>
            </div>
          </div>
        </section>

        {/* Topics Grid */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Alle Themen</h2>
          <TopicGrid topics={allTopics} />
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
