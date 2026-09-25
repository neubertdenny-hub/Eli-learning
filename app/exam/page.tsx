"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { CreateExamDialog } from "@/components/exam/CreateExamDialog"
import { MaterialUploadSection } from "@/components/exam/MaterialUploadSection"
import { TopicConfirmationDialog } from "@/components/exam/TopicConfirmationDialog"
import { MiniCheckSessionRunner } from "@/components/exam/MiniCheckSessionRunner"
import { PracticeExamSimulator } from "@/components/exam/PracticeExamSimulator"
import { getDaysUntilExam, formatDateGerman, EXAM_STATUS_LABELS } from "@/lib/exam/exam-manager"
import type { Exam } from "@/lib/db/exam-schema"
import type { AnalyzedTopic } from "@/lib/exam/material-analyzer"
import type { TopicReadinessReport, LearningPriority } from "@/lib/exam/readiness-engine"
import type { ExamLearningPlan } from "@/lib/exam/learning-planner"
import type { MiniCheckSession, TransferTask } from "@/lib/exam/mini-checks"
import type { PracticeExam } from "@/lib/exam/practice-exam-generator"

export default function ExamPage() {
  // Basic state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  
  // Material upload flow
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedTopics, setAnalyzedTopics] = useState<AnalyzedTopic[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  // Readiness & Planning
  const [readinessReport, setReadinessReport] = useState<any>(null)
  const [prioritizedTopics, setPrioritizedTopics] = useState<LearningPriority[]>([])
  const [learningPlan, setLearningPlan] = useState<ExamLearningPlan | null>(null)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  
  // Testing
  const [showMiniCheck, setShowMiniCheck] = useState(false)
  const [currentMiniCheckSession, setCurrentMiniCheckSession] = useState<MiniCheckSession | null>(null)
  const [showPracticeExam, setShowPracticeExam] = useState(false)
  const [currentPracticeExam, setCurrentPracticeExam] = useState<PracticeExam | null>(null)
  
  const activeExam = exams.find((e) => e.status !== "COMPLETED")

  const handleExamCreated = (exam: Exam) => {
    setExams([exam, ...exams])
    setSelectedExam(exam)
  }

  const handleMaterialsAnalyzed = (topics: AnalyzedTopic[]) => {
    setAnalyzedTopics(topics)
    setShowConfirmDialog(true)
  }

  const handleTopicsConfirmed = async (confirmedTopics: AnalyzedTopic[]) => {
    if (!selectedExam) return

    try {
      setIsAnalyzing(true)

      // 1. Save topics
      const topicsResponse = await fetch("/api/exam/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          topics: confirmedTopics.map((topic) => ({
            topicId: topic.topicName,
            subtopicId: topic.subtopics?.[0],
            sourceType: topic.sourceType || "CONFIRMED",
            confidence: topic.confidence || 0.8,
            priority: 5,
          })),
        }),
      })

      if (!topicsResponse.ok) throw new Error("Failed to save topics")

      // 2. Update status
      await fetch("/api/exam/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          newStatus: "PREPARING",
        }),
      })

      // 3. Generate readiness report
      const readinessResponse = await fetch("/api/exam/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          examDate: selectedExam.examDate,
          topics: confirmedTopics.map((t) => ({
            topicId: t.topicName,
            topicName: t.topicName,
          })),
        }),
      })

      let readinessData = null
      if (readinessResponse.ok) {
        readinessData = await readinessResponse.json()
        setReadinessReport(readinessData.readinessReport)
        setPrioritizedTopics(readinessData.prioritizedTopics)
      }

      // 4. Generate learning plan
      if (readinessData) {
        setIsGeneratingPlan(true)
        try {
          const planResponse = await fetch("/api/exam/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: selectedExam.id,
              topicPriorities: readinessData.prioritizedTopics || [],
              readinessReports: readinessData.readinessReport?.criticalTopics || [],
              daysUntilExam: getDaysUntilExam(selectedExam.examDate),
            }),
          })

          if (planResponse.ok) {
            const planData = await planResponse.json()
            setLearningPlan(planData.plan)
          }
        } finally {
          setIsGeneratingPlan(false)
        }
      }

      setShowConfirmDialog(false)
      setAnalyzedTopics([])
      setSelectedExam({
        ...selectedExam,
        status: "PREPARING",
      })
      setExams(
        exams.map((e) =>
          e.id === selectedExam.id ? { ...e, status: "PREPARING" } : e
        )
      )
    } catch (error) {
      console.error("[Topics Confirmation Error]", error)
      alert("❌ Fehler beim Speichern. Bitte versuche es erneut.")
    } finally {
      setIsAnalyzing(false)
      setIsGeneratingPlan(false)
    }
  }

  const handleStartMiniCheck = async (topicId: string) => {
    const topic = readinessReport?.criticalTopics.find(
      (t: any) => t.topicId === topicId
    ) || readinessReport?.wellPreparedTopics.find(
      (t: any) => t.topicId === topicId
    )

    if (!topic) return

    try {
      const response = await fetch("/api/exam/mini-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          topicName: topic.topicName,
          masteryScore: topic.readinessScore,
          daysUntilExam: selectedExam ? getDaysUntilExam(selectedExam.examDate) : 7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentMiniCheckSession(data.session)
        setShowMiniCheck(true)
      }
    } catch (error) {
      console.error("Failed to start mini-check:", error)
    }
  }

  const handleStartPracticeExam = async () => {
    if (!selectedExam) return

    try {
      const response = await fetch("/api/exam/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          confirmedTopicIds: prioritizedTopics.map((p) => p.topicId),
          readinessReports: readinessReport?.criticalTopics || [],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentPracticeExam(data.exam)
        setShowPracticeExam(true)
      }
    } catch (error) {
      console.error("Failed to generate practice exam:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={0} maxXP={1000} coins={0} />

      <main className="flex-1 w-full py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
              📝 Klassenarbeit
            </h1>
            <p className="text-gray-600 text-lg">
              Vorbereitung auf deine Mathematik-Klassenarbeit
            </p>
          </div>

          {/* No Active Exam */}
          {!activeExam && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 sm:p-12 border-2 border-purple-200 text-center space-y-6">
              <div className="text-5xl">🎯</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Noch keine Klassenarbeit geplant
                </h2>
                <p className="text-gray-600">
                  Erzähle ELI von deiner nächsten Mathearbeit und wir erstellen einen Lernplan.
                </p>
              </div>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all inline-block shadow-lg"
              >
                🚀 Neue Klassenarbeit anlegen
              </button>
            </div>
          )}

          {/* Active Exam - PLANNING */}
          {activeExam && activeExam.status === "PLANNING" && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
              <p className="text-gray-600">📚 Material Upload (Komponente wird integriert)</p>
            </div>
          )}

          {/* Active Exam - PREPARING */}
          {activeExam && activeExam.status === "PREPARING" && (
            <div className="space-y-6">
              {/* Exam Overview */}
              <div className="bg-white rounded-2xl border-2 border-blue-300 p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {activeExam.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {getDaysUntilExam(activeExam.examDate)} Tage bis zur Prüfung
                    </p>
                  </div>
                </div>
              </div>

              {/* Readiness Overview */}
              {readinessReport && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-300 p-6 sm:p-8 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">📊 Dein Vorbereitungsstand</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-4xl font-bold text-blue-600">
                        {readinessReport.overallReadiness}%
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Gesamt Readiness</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {readinessReport.readyTopics}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">✅ Fertig</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {readinessReport.foundationTopics}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">🔴 Grundlagen</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Learning Plan */}
              {learningPlan && (
                <div className="bg-white rounded-2xl border-2 border-green-300 p-6 sm:p-8 space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">📅 Dein Lernplan</h3>
                  <p className="text-gray-600">
                    {learningPlan.dailyPlan.length} Tage • {learningPlan.recommendedDailyMinutes} min/Tag
                  </p>
                  <div className="space-y-2">
                    {learningPlan.dailyPlan.slice(0, 3).map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-bold text-gray-900">{day.date}</span>
                        <span className="text-sm text-gray-600">
                          {day.activities.map((a) => a.activityType).join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleStartMiniCheck(prioritizedTopics[0]?.topicId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition"
                >
                  📝 Mini-Check starten
                </button>
                <button
                  onClick={handleStartPracticeExam}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition"
                >
                  🎓 Probe-Klassenarbeit
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateExamDialog
          isOpen={true}
          onExamCreated={handleExamCreated}
          onClose={() => setShowCreateDialog(false)}
        />
      )}

      {/* TopicConfirmationDialog - integration pending */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <p className="text-gray-600">📋 Topic Confirmation (Component wird integriert)</p>
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {showMiniCheck && currentMiniCheckSession && (
        <MiniCheckSessionRunner
          session={currentMiniCheckSession}
          onComplete={(result) => {
            console.log("[Mini-Check Complete]", result)
            setShowMiniCheck(false)
            // TODO: Trigger re-planning if needed
          }}
          onCancel={() => setShowMiniCheck(false)}
        />
      )}

      {showPracticeExam && currentPracticeExam && (
        <PracticeExamSimulator
          exam={currentPracticeExam}
          onComplete={(result) => {
            console.log("[Practice Exam Complete]", result)
            setShowPracticeExam(false)
          }}
          onCancel={() => setShowPracticeExam(false)}
        />
      )}

      <Navigation />
    </div>
  )
}
