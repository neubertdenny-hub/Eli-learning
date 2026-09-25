"use client"

import React, { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { CreateExamDialog } from "@/components/exam/CreateExamDialog"
import { MaterialUploadSection } from "@/components/exam/MaterialUploadSection"
import { TopicConfirmationDialog } from "@/components/exam/TopicConfirmationDialog"
import { getDaysUntilExam, formatDateGerman, EXAM_STATUS_LABELS } from "@/lib/exam/exam-manager"
import type { Exam } from "@/lib/db/exam-schema"
import type { AnalyzedTopic } from "@/lib/exam/material-analyzer"

export default function ExamPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzedTopics, setAnalyzedTopics] = useState<AnalyzedTopic[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

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

      // 1. Save confirmed topics to exam_topics table
      const topicsResponse = await fetch("/api/exam/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          topics: confirmedTopics.map((topic) => ({
            topicId: topic.topicId,
            subtopicId: topic.subtopicId,
            sourceType: topic.sourceType,
            confidence: topic.confidence,
            priority: topic.priority || 5,
          })),
        }),
      })

      if (!topicsResponse.ok) {
        throw new Error("Failed to save topics")
      }

      const topicsData = await topicsResponse.json()
      console.log("[Topics Saved]", topicsData)

      // 2. Update exam status to PREPARING
      const statusResponse = await fetch("/api/exam/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam.id,
          newStatus: "PREPARING",
        }),
      })

      if (!statusResponse.ok) {
        throw new Error("Failed to update exam status")
      }

      const statusData = await statusResponse.json()
      console.log("[Status Updated]", statusData)

      // 3. Update UI
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
      alert("❌ Fehler beim Speichern der Topics. Bitte versuche es erneut.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pb-24 sm:pb-32">
      <Header userName="Zoey" currentLevel={1} currentXP={0} maxXP={1000} coins={0} />

      <main className="flex-1 w-full py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Title */}
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
                  Erzähle ELI von deiner nächsten Mathearbeit und wir erstellen
                  einen Lernplan für dich.
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

          {/* Active Exam */}
          {activeExam && (
            <div className="space-y-6">
              {/* Exam Card */}
              <div className="bg-white rounded-2xl border-2 border-blue-300 p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {activeExam.title}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {EXAM_STATUS_LABELS[activeExam.status]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-blue-600">
                      {getDaysUntilExam(activeExam.examDate)}
                    </p>
                    <p className="text-sm text-gray-600">Tage</p>
                  </div>
                </div>

                {/* Date */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">📅 Datum</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDateGerman(activeExam.examDate)}
                  </p>
                </div>

                {/* Description */}
                {activeExam.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-1">
                      📝 Beschreibung
                    </p>
                    <p className="text-gray-800">{activeExam.description}</p>
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6 sm:p-8 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  📚 Nächster Schritt
                </h3>

                {activeExam.status === "PLANNING" && (
                  <MaterialUploadSection
                    examId={activeExam.id}
                    onMaterialsAnalyzed={handleMaterialsAnalyzed}
                    isAnalyzing={isAnalyzing}
                  />
                )}

                {activeExam.status === "PREPARING" && (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Dein Lernplan ist bereit! Lerne die Themen in deinen
                      täglichen Missionen.
                    </p>
                    <button
                      onClick={() => {
                        /* TODO: Navigate to missions */
                      }}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl transition-all inline-block"
                    >
                      🚀 Zu deinen Missionen
                    </button>
                  </div>
                )}

                {activeExam.status === "READY_FOR_SIMULATION" && (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Du bist bereit für eine Probe-Klassenarbeit! Sieh, was du
                      schon kannst.
                    </p>
                    <button
                      onClick={() => {
                        /* TODO: Start simulation */
                      }}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all inline-block"
                    >
                      📝 Probe-Klassenarbeit starten
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-lg font-bold text-gray-900">
                    {EXAM_STATUS_LABELS[activeExam.status]}
                  </p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Themen</p>
                  <p className="text-lg font-bold text-gray-900">
                    -- / --
                  </p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Material</p>
                  <p className="text-lg font-bold text-gray-900">
                    -- Datei(en)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Navigation />

      {/* Create Exam Dialog */}
      <CreateExamDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onExamCreated={handleExamCreated}
      />

      {/* Topic Confirmation Dialog */}
      <TopicConfirmationDialog
        isOpen={showConfirmDialog}
        topics={analyzedTopics}
        onConfirm={handleTopicsConfirmed}
      />
    </div>
  )
}
