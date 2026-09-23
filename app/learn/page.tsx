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
import { MissionResumeManager } from "@/lib/learning/mission-resume"

export default function LearnPage() {
  const [missionStarted, setMissionStarted] = useState(false)
  const [plannedMission, setPlannedMission] = useState<DailyMission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resumeAvailable, setResumeAvailable] = useState(false)
  const [resumeSummary, setResumeSummary] = useState<any>(null)

  // Phase 5C: Mission Resume + Auto-Generation
  useEffect(() => {
    const initMission = async () => {
      try {
        setLoading(true)

        // Prüfe ob Mission resumierbar ist
        const resumeManager = new MissionResumeManager()
        const canResume = resumeManager.canResume()

        if (canResume) {
          const summary = resumeManager.getResumeSummary()
          setResumeAvailable(true)
          setResumeSummary(summary)
          // Lade auch geplante Mission für Alternative
        }

        // Generiere neue Mission falls nicht resumierbar
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
        console.error("Mission init failed:", err)
        setError("Konnte Mission nicht erstellen")
      } finally {
        setLoading(false)
      }
    }

    initMission()
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

  // Phase 5C: Zeige Resume Option oder neue Mission
  if (plannedMission) {
    return (
      <>
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        {/* Resume Option */}
        {resumeAvailable && resumeSummary && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b-2 border-blue-300 py-6 px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl">⏸️</div>
                <div>
                  <p className="font-bold text-lg text-gray-900">Mission pausiert</p>
                  <p className="text-sm text-gray-600">
                    {resumeSummary.progress} • {resumeSummary.timeUsed} • {resumeSummary.xpEarned} XP
                  </p>
                  <p className="text-xs text-gray-500">{resumeSummary.lastSaved}</p>
                </div>
              </div>
              <button
                onClick={() => setMissionStarted(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
              >
                ▶️ Fortsetzen
              </button>
            </div>
          </div>
        )}

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
