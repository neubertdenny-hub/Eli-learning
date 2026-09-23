/**
 * Learn Page - Phase 5B
 *
 * Auto-generiert persönliche Mission basierend auf:
 * - Aktuellem Schulstoff
 * - Foundation Gaps
 * - Review Schedule
 * - Mastery Levels
 */

"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { MissionInterface } from "@/components/training/MissionInterface"
import { MissionStartScreen } from "@/components/training/MissionStartScreen"
import { DailyMission } from "@/lib/learning/mission-planner"

export default function LearnPage() {
  const [missionStarted, setMissionStarted] = useState(false)
  const [plannedMission, setPlannedMission] = useState<DailyMission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Phase 5B: Automatisch Mission erstellen
  useEffect(() => {
    const buildMission = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/build-daily-mission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: "user_zoey" }),
        })

        if (!response.ok) {
          throw new Error("Fehler beim Erstellen der Mission")
        }

        const data = await response.json()
        setPlannedMission(data.mission)
        setError(null)
      } catch (err) {
        console.error("Mission build failed:", err)
        setError("Konnte Mission nicht erstellen")
      } finally {
        setLoading(false)
      }
    }

    buildMission()
  }, [])

  if (missionStarted && plannedMission) {
    return (
      <MissionInterface
        skillName={plannedMission.blocks[0]?.topicName || "Lernmission"}
        difficultyLevel={2}
        onMissionComplete={(xpEarned, perfectMission) => {
          alert(`🎉 Mission fertig! ${xpEarned} XP ${perfectMission ? "✅ Perfect!" : ""}`)
          setMissionStarted(false)
        }}
        onClose={() => setMissionStarted(false)}
      />
    )
  }

  // Phase 5B: Zeige auto-generierte Mission
  if (plannedMission) {
    return (
      <>
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />
        <MissionStartScreen
          mission={plannedMission}
          onStart={() => setMissionStarted(true)}
          onSkip={() => {
            alert("Feature: Freie Themenwahl kommt in Phase 5C")
          }}
          loading={loading}
        />
        <Navigation />
      </>
    )
  }

  // Fallback wenn Mission nicht geladen
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

      <main className="flex-1 w-full py-8 sm:py-10">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-900">Mission konnte nicht geladen werden</h1>
          <p className="text-gray-600">{error || "Unbekannter Fehler"}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <span>←</span>
            <span>Zurück zur Startseite</span>
          </Link>
        </div>
      </main>

      <Navigation />
    </div>
  )
}
