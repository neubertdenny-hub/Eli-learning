/**
 * Progress Page - Modern UI Redesign
 *
 * Mobile-first, spacious design for 13+ year olds
 * Large cards, clear hierarchy, modern aesthetics
 */

"use client"

import React from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"

export default function ProgressPage() {
  const allTopics = [
    {
      title: "Grundrechenarten",
      emoji: "🧮",
      status: "new" as const,
      href: "/training/grundrechenarten",
    },
    {
      title: "Bruchrechnung",
      emoji: "🍰",
      status: "green" as const,
      successRate: 85,
      lastPracticed: "Heute",
      href: "/training/bruchrechnung",
    },
    {
      title: "Negative Zahlen",
      emoji: "❄️",
      status: "yellow" as const,
      successRate: 60,
      lastPracticed: "Gestern",
      href: "/training/negative-zahlen",
    },
    {
      title: "Multiplikation",
      emoji: "✖️",
      status: "red" as const,
      successRate: 40,
      lastPracticed: "Vor 3 Tagen",
      href: "/training/multiplikation",
    },
    {
      title: "Division",
      emoji: "➗",
      status: "green" as const,
      successRate: 78,
      lastPracticed: "Vor 1 Woche",
      href: "/training/division",
    },
    {
      title: "Gleichungen",
      emoji: "⚖️",
      status: "yellow" as const,
      successRate: 55,
      lastPracticed: "Vor 2 Tagen",
      href: "/training/gleichungen",
    },
    {
      title: "Geometrie",
      emoji: "📐",
      status: "new" as const,
      href: "/training/geometrie",
    },
  ]

  const stats = {
    totalTopics: allTopics.length,
    greenTopics: allTopics.filter((t) => t.status === "green").length,
    yellowTopics: allTopics.filter((t) => t.status === "yellow").length,
    redTopics: allTopics.filter((t) => t.status === "red").length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "from-green-500 to-emerald-600"
      case "yellow":
        return "from-amber-500 to-orange-600"
      case "red":
        return "from-red-500 to-rose-600"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-50 hover:bg-green-100/60"
      case "yellow":
        return "bg-amber-50 hover:bg-amber-100/60"
      case "red":
        return "bg-red-50 hover:bg-red-100/60"
      default:
        return "bg-gray-50 hover:bg-gray-100/60"
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 w-full py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Title */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">Dein Fortschritt</h1>
            <p className="text-gray-600 text-lg">Überblick über deine Lernreise</p>
          </div>

          {/* Stat Cards - Modern & Spacious */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Topics */}
            <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {stats.totalTopics}
                </div>
                <div className="text-3xl">📚</div>
              </div>
              <p className="text-gray-600 font-medium">Skills insgesamt</p>
            </div>

            {/* Mastered */}
            <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-green-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {stats.greenTopics}
                </div>
                <div className="text-3xl">✅</div>
              </div>
              <p className="text-gray-600 font-medium">Gemeistert</p>
            </div>

            {/* In Progress */}
            <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-amber-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.yellowTopics}
                </div>
                <div className="text-3xl">⚡</div>
              </div>
              <p className="text-gray-600 font-medium">In Arbeit</p>
            </div>

            {/* Needs Help */}
            <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-red-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {stats.redTopics}
                </div>
                <div className="text-3xl">🆘</div>
              </div>
              <p className="text-gray-600 font-medium">Zum Üben</p>
            </div>
          </div>

          {/* Skills Grid */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Alle Skills</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {allTopics.map((topic) => (
                <Link key={topic.title} href={topic.href}>
                  <div
                    className={`relative h-40 sm:h-48 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${getStatusBg(
                      topic.status
                    )} border border-gray-200/50`}
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(
                        topic.status
                      )} opacity-5`}
                    />

                    {/* Content */}
                    <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between">
                      {/* Top: Emoji & Title */}
                      <div>
                        <div className="text-5xl sm:text-6xl mb-3">{topic.emoji}</div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                          {topic.title}
                        </h3>
                      </div>

                      {/* Bottom: Stats or New Badge */}
                      {topic.status === "new" ? (
                        <div className="text-sm font-semibold text-gray-600 bg-white/70 px-3 py-1.5 rounded-full w-fit">
                          🆕 Neu
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getStatusColor(topic.status)}`}
                              style={{
                                width: `${topic.successRate}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="font-semibold text-gray-700">
                              {topic.successRate}%
                            </span>
                            <span className="text-gray-500">{topic.lastPracticed}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Back Link */}
          <div className="flex justify-center pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              <span>←</span>
              <span>Zur Startseite</span>
            </Link>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
