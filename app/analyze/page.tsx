/**
 * Analyze Page – Phase 3
 *
 * Flow nach Upload:
 * 1. Fetch Document + Start Analysis
 * 2. Eli Thinking State (animated)
 * 3. OpenAI Structured Output
 * 4. Results Display (theme, subtopic, tasks, prerequisites)
 */

"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages"

interface AnalysisResult {
  theme: string
  subtopic: string
  description: string
  suggestedTasks: {
    id: string
    title: string
    difficulty: "easy" | "medium" | "hard"
  }[]
  prerequisites: string[]
  confidence: number
}

type PageState = "loading" | "analyzing" | "success" | "error" | "uncertain"

function AnalyzePageContent() {
  const searchParams = useSearchParams()
  const docId = searchParams?.get("docId")

  const [state, setState] = useState<PageState>("loading")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const performAnalysis = async () => {
      if (!docId) {
        setError("Keine Datei gefunden 🤷")
        setState("error")
        return
      }

      try {
        setState("analyzing")

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-document-id": docId,
          },
          body: JSON.stringify({ documentId: docId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Analyse fehlgeschlagen")
        }

        const data = await response.json()

        // Check confidence
        if (data.confidence < 0.7) {
          setState("uncertain")
          setAnalysis(data)
          return
        }

        setAnalysis(data)
        setState("success")
      } catch (err) {
        const friendlyMsg = getFriendlyErrorMessage(err instanceof Error ? err : new Error(String(err)))
        setError(friendlyMsg)
        setState("error")
      }
    }

    performAnalysis()
  }, [docId])

  // ========== LOADING ==========

  if (state === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 flex flex-col items-center justify-center">
          <EliSpeaking
            mood="thinking"
            size="lg"
            message="Ich hole mir dein Foto... 📸"
          />
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== ANALYZING ==========

  if (state === "analyzing") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 flex flex-col items-center justify-center space-y-8">
          <EliSpeaking
            mood="thinking"
            size="lg"
            message="Ich denke darüber nach... ⏳"
          />

          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 space-y-4">
              <div className="flex gap-2 justify-center">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce animation-delay-100" />
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce animation-delay-200" />
              </div>
              <p className="text-center text-sm text-gray-600">
                Eli analysiert dein Material...
              </p>
            </div>
          </div>
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== ERROR ==========

  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
          <EliSpeaking mood="thinking" size="lg" message={error} />

          <section className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all"
            >
              ← Zurück zum Upload
            </button>
          </section>
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== UNCERTAIN ==========

  if (state === "uncertain" && analysis) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
          <EliSpeaking
            mood="thinking"
            size="lg"
            message="Hmm 🤖 Ich bin mir nicht ganz sicher, was ich auf dem Bild sehe."
          />

          <section className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-300 space-y-4">
            <p className="text-gray-700">
              Das Bild könnte zu unscharf, zu klein oder schwer zu lesen sein.
            </p>
          </section>

          <section className="space-y-4">
            <button
              onClick={() => window.location.href = "/upload"}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all"
            >
              📸 Neues Foto aufnehmen
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              ← Zurück
            </button>
          </section>
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== SUCCESS ==========

  if (state === "success" && analysis) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
          {/* Eli Success */}
          <section className="flex flex-col items-center text-center space-y-4">
            <EliSpeaking
              mood="happy"
              size="md"
              message="Eli hat's erkannt! 🎉"
            />
          </section>

          {/* Results Cards */}
          <section className="space-y-4">
            {/* Theme */}
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📚</span>
                <h3 className="text-lg font-bold text-gray-900">Thema</h3>
              </div>
              <p className="text-base text-gray-700">{analysis.theme}</p>
            </div>

            {/* Subtopic */}
            <div className="bg-white rounded-2xl p-6 border-2 border-green-200 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧩</span>
                <h3 className="text-lg font-bold text-gray-900">
                  Das lernst du gerade
                </h3>
              </div>
              <p className="text-base text-gray-700">{analysis.subtopic}</p>
              {analysis.description && (
                <p className="text-sm text-gray-600">{analysis.description}</p>
              )}
            </div>

            {/* Suggested Tasks */}
            {analysis.suggestedTasks && analysis.suggestedTasks.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✏️</span>
                  <h3 className="text-lg font-bold text-gray-900">
                    Gefundene Aufgaben
                  </h3>
                </div>
                <div className="space-y-2">
                  {analysis.suggestedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-400"
                    >
                      <p className="font-semibold text-gray-900">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Schwierigkeit:{" "}
                        {task.difficulty === "easy"
                          ? "Einfach 🟢"
                          : task.difficulty === "medium"
                            ? "Mittel 🟡"
                            : "Schwer 🔴"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {analysis.prerequisites && analysis.prerequisites.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-lg font-bold text-gray-900">
                    Das brauchst du dafür
                  </h3>
                </div>
                <div className="space-y-2">
                  {analysis.prerequisites.map((prereq, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      <span className="text-gray-700">{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-300">
            <p className="text-center text-lg font-bold text-gray-900 mb-4">
              Welche Aufgabe wollen wir zusammen machen?
            </p>

            {analysis.suggestedTasks && analysis.suggestedTasks.length > 0 && (
              <div className="space-y-3">
                {analysis.suggestedTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      // Phase 4: Task Runner
                      window.location.href = `/task-runner?taskId=${task.id}`
                    }}
                    className="w-full bg-white hover:bg-purple-50 border-2 border-purple-300 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all text-left"
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => window.location.href = "/upload"}
              className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              ← Anderes Material hochladen
            </button>
          </section>
        </main>

        <Navigation />
      </div>
    )
  }

  return null
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <AnalyzePageContent />
    </Suspense>
  )
}
