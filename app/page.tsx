/**
 * ELI – Home Page (Premium Edition)
 *
 * Main hub for learning with modern, polished design.
 */

"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { MissionCard } from "@/components/task/MissionCard"
import { TopicCard } from "@/components/task/TopicCard"

export default function HomePage() {
  const router = useRouter()
  const [userStats, setUserStats] = React.useState({
    name: "Zoey",
    level: 1,
    xp: 0,
    maxXP: 100,
    streak: 3,
  })

  React.useEffect(() => {
    const userId = "test-user"
    const stored = localStorage.getItem(`user-rewards:${userId}`)
    if (stored) {
      const rewards = JSON.parse(stored)
      setUserStats(prev => ({ ...prev, xp: rewards.xp || 0, level: rewards.level || 1 }))
    }
  }, [])

  const currentMission = {
    title: "Addieren mit negativen Zahlen",
    description: "Lerne, wie man negative Zahlen addiert",
    duration: "ca. 20 Minuten",
    difficulty: 2 as const,
  }

  const recentTopics = [
    {
      title: "Bruchrechnung",
      emoji: "🍰",
      status: "green" as const,
      successRate: 85,
      lastPracticed: "Heute",
    },
    {
      title: "Negative Zahlen",
      emoji: "❄️",
      status: "yellow" as const,
      successRate: 60,
      lastPracticed: "Gestern",
    },
    {
      title: "Multiplikation",
      emoji: "✖️",
      status: "red" as const,
      successRate: 40,
      lastPracticed: "Vor 3 Tagen",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-blue-50 pb-24 sm:pb-32">
      {/* Header */}
      <Header
        userName={userStats.name}
        currentLevel={userStats.level}
        currentXP={userStats.xp}
        maxXP={userStats.maxXP}
        streak={userStats.streak}
        showParentAccess={true}
        onParentClick={() => router.push("/parent")}
      />

      {/* Main Content */}
      <main className="flex-1 container-full py-8 sm:py-12 space-y-10">
        {/* Welcome Section */}
        <section className="flex flex-col items-center text-center space-y-6 animate-fade-in">
          <EliSpeaking
            mood="happy"
            size="lg"
            message="Hey Zoey! 👋 Bereit für unsere Mathe-Mission?"
          />
        </section>

        {/* Primary CTA: Mission */}
        <section className="animate-slide-in-up">
          <MissionCard
            title={currentMission.title}
            description={currentMission.description}
            duration={currentMission.duration}
            difficulty={currentMission.difficulty}
            href="/learn"
          />
        </section>

        {/* Exam Preparation Section */}
        <section>
          <Link href="/exam">
            <button className="w-full card-elevated overflow-hidden hover:shadow-xl transition-all duration-200 group">
              <div className="relative p-8 sm:p-10 bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-200 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" />

                <div className="relative space-y-3">
                  <div className="text-5xl sm:text-6xl">📝</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Klassenarbeit vorbereiten
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700">
                    Lade dein Material hoch und erstelle einen Lernplan
                  </p>
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-700 mt-6 group-hover:gap-3 transition-all">
                    <span>Zur Vorbereitung</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </button>
          </Link>
        </section>

        {/* Upload Section */}
        <section>
          <Link href="/upload">
            <button className="w-full card-elevated overflow-hidden hover:shadow-xl transition-all duration-200 group">
              <div className="relative p-8 sm:p-10 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-200 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" />

                <div className="relative space-y-3">
                  <div className="text-5xl sm:text-6xl">📸</div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Neues Thema hochladen
                  </h3>
                  <p className="text-base sm:text-lg text-gray-700">
                    Fotografiere dein Mathebuch oder Arbeitsblatt
                  </p>
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold text-purple-700 mt-6 group-hover:gap-3 transition-all">
                    <span>Jetzt hochladen</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </button>
          </Link>
        </section>

        {/* Topics Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Deine Themen</h2>
            <p className="text-gray-600">Dein aktueller Lernfortschritt</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentTopics.map((topic, idx) => (
              <TopicCard key={idx} {...topic} />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Link
              href="/progress"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 group"
            >
              <span>Alle Themen anschauen</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* Weekly Stats */}
        <section className="card-elevated bg-gradient-to-br from-white to-blue-50 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-200 rounded-full opacity-5" />
          <div className="relative p-8 sm:p-10 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Diese Woche</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {/* Sessions */}
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">3</div>
                <div className="text-sm text-gray-600 font-medium">Sessions</div>
              </div>

              {/* XP */}
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-green-600 mb-2">125</div>
                <div className="text-sm text-gray-600 font-medium">XP verdient</div>
              </div>

              {/* Tasks */}
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-purple-600 mb-2">8</div>
                <div className="text-sm text-gray-600 font-medium">Aufgaben</div>
              </div>

              {/* Streak */}
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-orange-600 mb-2">3</div>
                <div className="text-sm text-gray-600 font-medium">Tage Streak 🔥</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Navigation */}
      <Navigation />
    </div>
  )
}
