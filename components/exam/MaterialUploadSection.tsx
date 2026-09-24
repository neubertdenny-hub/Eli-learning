"use client"

import React, { useState } from "react"
import type { AnalyzedTopic } from "@/lib/exam/material-analyzer"

interface MaterialUploadSectionProps {
  examId: string
  onMaterialsAnalyzed: (topics: AnalyzedTopic[], materialId: string) => void
  isAnalyzing?: boolean
}

export function MaterialUploadSection({
  examId,
  onMaterialsAnalyzed,
  isAnalyzing = false,
}: MaterialUploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    const newFiles = Array.from(files).filter((f) => {
      // Accept: images, PDF
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ]
      return validTypes.includes(f.type)
    })

    if (newFiles.length + uploadedFiles.length > 10) {
      setError("Maximal 10 Dateien pro Klassenarbeit")
      return
    }

    setUploadedFiles([...uploadedFiles, ...newFiles])
    setError("")
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      setError("Wähle mindestens eine Datei")
      return
    }

    setUploading(true)
    setError("")

    try {
      const materials = uploadedFiles.map((file) => ({
        fileName: file.name,
        size: file.size,
        // In real scenario: upload file and get URL
        // For now: use data URL for small files
        documentUrl: URL.createObjectURL(file),
      }))

      const response = await fetch("/api/exam/material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          materials,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload fehlgeschlagen")
      }

      const data = await response.json()
      onMaterialsAnalyzed(data.topics, examId)
      setUploadedFiles([])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload fehlgeschlagen"
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6 sm:p-8 space-y-4">
      <h3 className="text-2xl font-bold text-gray-900">
        📸 Material hochladen
      </h3>

      <p className="text-gray-700">
        Lade deine Stoffzettel, Arbeitsblätter, Hefteinträge oder Buchseiten
        hoch. ELI analysiert sie und erstellt einen Lernplan.
      </p>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-100 transition-colors">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileSelect}
          disabled={uploading || isAnalyzing}
          className="hidden"
          id="material-upload"
        />
        <label
          htmlFor="material-upload"
          className="block cursor-pointer space-y-2"
        >
          <div className="text-4xl">📁</div>
          <p className="font-bold text-gray-900">
            Klick oder ziehe Dateien hier rein
          </p>
          <p className="text-sm text-gray-600">
            Bilder (JPG, PNG) oder PDF • Max 10 Dateien
          </p>
        </label>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-sm font-bold text-gray-700 mb-3">
            {uploadedFiles.length} Datei(en) ausgewählt
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFiles(
                      uploadedFiles.filter((_, i) => i !== idx)
                    )
                  }}
                  disabled={uploading || isAnalyzing}
                  className="ml-2 text-red-600 hover:text-red-700 font-bold text-sm disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 text-sm text-red-700 font-bold">
          ❌ {error}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploadedFiles.length === 0 || uploading || isAnalyzing}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50"
      >
        {uploading || isAnalyzing ? "⏳ Wird analysiert..." : "🚀 Hochladen & Analysieren"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        ELI wird die Dateien analysieren und erkannte Themen zeigen
      </p>
    </div>
  )
}
