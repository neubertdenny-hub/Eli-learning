"use client"

import React, { useState } from "react"
import { formatDateGerman, parseDateGerman } from "@/lib/exam/exam-manager"
import type { Exam } from "@/lib/db/exam-schema"

interface CreateExamDialogProps {
  isOpen: boolean
  onClose: () => void
  onExamCreated: (exam: Exam) => void
  userId?: string
}

export function CreateExamDialog({
  isOpen,
  onClose,
  onExamCreated,
}: CreateExamDialogProps) {
  const [title, setTitle] = useState("")
  const [examDate, setExamDate] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!title.trim()) {
        throw new Error("Titel erforderlich")
      }

      if (!examDate.trim()) {
        throw new Error("Datum erforderlich")
      }

      // Parse German date format DD.MM.YYYY
      const dateObj = parseDateGerman(examDate)
      const isoDate = dateObj.toISOString().split("T")[0]

      const res = await fetch("/api/exam/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          examDate: isoDate,
          description: description || undefined,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create exam")
      }

      onExamCreated(data.exam)
      setTitle("")
      setExamDate("")
      setDescription("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📝 Neue Klassenarbeit
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Bereite dich auf deine Mathearbeit vor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Mathe Klassenarbeit"
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Datum (TT.MM.JJJJ)
            </label>
            <input
              type="text"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              placeholder="15.10.2026"
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500 font-mono"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Nur Datum, keine Uhrzeit
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Beschreibung (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Bruchrechnung, Negative Zahlen..."
              className="w-full border-2 border-gray-300 rounded-lg p-3 h-20 focus:outline-none focus:border-blue-500 resize-none"
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 text-sm text-red-700 font-bold">
              ❌ {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? "⏳ Erstelle..." : "🚀 Vorbereitung starten"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
