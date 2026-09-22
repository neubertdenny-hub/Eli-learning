/**
 * Upload Page – Phase 3 Vollständig
 *
 * Vollständiger Flow:
 * - Kamera / Galerie / Datei-Upload
 * - Vorschau
 * - Dateivalidierung
 * - Upload-Fortschritt
 * - Error Handling
 * - Retry-Logik
 */

"use client"

import React, { useRef, useState } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliSpeaking } from "@/components/eli/EliRobot"
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages"
import { ZOEY_USER_ID } from "@/lib/constants/users"

type UploadState = "idle" | "previewing" | "uploading" | "success" | "error"

interface UploadedFile {
  documentId: string
  storageUrl: string
  fileName: string
  fileSize: number
}

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle")
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE_MB = 10
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"]

  // ========== FILE VALIDATION ==========

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return "Diesen Dateityp kann ich nicht lesen 🤷 Versuch ein Foto oder PDF."
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return "Das Bild ist zu groß 📸 Mach ein kleineres Foto."
    }
    return null
  }

  // ========== FILE SELECTION ==========

  const handleFileSelected = (f: File | null) => {
    if (!f) return

    const validationError = validateFile(f)
    if (validationError) {
      setError(validationError)
      setState("error")
      return
    }

    setFile(f)
    setError("")

    // Create preview
    if (f.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        setState("previewing")
      }
      reader.readAsDataURL(f)
    } else {
      // PDF - show icon
      setPreview("pdf")
      setPreview(null)
      setFile(f)
      setState("previewing")
    }
  }

  const handleCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  const handleGallerySelect = () => {
    fileInputRef.current?.click()
  }

  // ========== UPLOAD ==========

  const handleUpload = async () => {
    if (!file) return

    setState("uploading")
    setUploadProgress(0)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress (in real implementation, use XMLHttpRequest for real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 30, 90))
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "x-user-id": ZOEY_USER_ID,
        },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload fehlgeschlagen")
      }

      const data = await response.json()

      setUploaded({
        documentId: data.documentId,
        storageUrl: data.storageUrl,
        fileName: file.name,
        fileSize: file.size,
      })

      setState("success")
    } catch (err) {
      const friendlyMsg = getFriendlyErrorMessage(err as any)
      setError(friendlyMsg)
      setState("error")
      setUploadProgress(0)
    }
  }

  const handleRetry = () => {
    setState("idle")
    setPreview(null)
    setFile(null)
    setError("")
    setUploadProgress(0)
    setUploaded(null)
  }

  const handleAnalyze = async () => {
    if (!uploaded) return

    // Redirect to analyze page with documentId
    window.location.href = `/analyze?docId=${uploaded.documentId}`
  }

  // ========== UI: IDLE STATE ==========

  if (state === "idle") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
          {/* Welcome */}
          <section className="flex flex-col items-center text-center space-y-6">
            <EliSpeaking
              mood="encouraging"
              size="md"
              message="Zeige mir, was du lernen möchtest! 📚"
            />
          </section>

          {/* Upload Zone */}
          <section className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Camera Button */}
              <button
                onClick={handleCameraCapture}
                className="card-elevated p-6 sm:p-8 hover:shadow-lg transition-all"
              >
                <div className="text-5xl mb-4">📷</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Mit Kamera aufnehmen
                </h3>
                <p className="text-sm text-gray-600">
                  Mach ein Foto deines Matheheftes
                </p>
              </button>

              {/* Gallery Button */}
              <button
                onClick={handleGallerySelect}
                className="card-elevated p-6 sm:p-8 hover:shadow-lg transition-all"
              >
                <div className="text-5xl mb-4">📁</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Aus Galerie wählen
                </h3>
                <p className="text-sm text-gray-600">
                  Foto, Screenshot oder PDF
                </p>
              </button>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
              className="hidden"
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
              className="hidden"
            />
          </section>

          {/* Info */}
          <section className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tipps für gute Fotos 📸</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✅ Gutes Licht – das Foto sollte hell sein</p>
              <p>✅ Ganz gerade – halte die Kamera senkrecht</p>
              <p>✅ Scharf – nicht verwackelt</p>
              <p>✅ Lesbar – Text muss zu lesen sein</p>
            </div>
          </section>
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== UI: PREVIEW STATE ==========

  if (state === "previewing" && file) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
          {/* Preview */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Dein Foto 📷</h2>

            <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 max-h-96 overflow-y-auto">
              {preview && file.type.startsWith("image/") ? (
                <img src={preview} alt="Vorschau" className="w-full rounded-lg" />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg font-bold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="space-y-4">
            <button
              onClick={handleUpload}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
            >
              🚀 Mit Eli analysieren
            </button>

            <button
              onClick={handleRetry}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              ← Anderes Foto wählen
            </button>
          </section>
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== UI: UPLOADING STATE ==========

  if (state === "uploading") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8 flex flex-col items-center justify-center">
          <EliSpeaking mood="thinking" size="lg" message="Ich schaue mir das an... ⏳" />

          <div className="w-full max-w-md space-y-4 mt-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-200">
              <div className="text-center mb-4">
                <p className="text-lg font-bold text-gray-900">Wird hochgeladen... {uploadProgress}%</p>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-purple-700 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== UI: SUCCESS STATE ==========

  if (state === "success" && uploaded) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
          <EliSpeaking mood="happy" size="lg" message="Super! Das Foto habe ich! 🎉" />

          <section className="bg-white rounded-2xl p-6 sm:p-8 border-3 border-green-400 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Hochgeladen!
              </h2>
              <p className="text-gray-600">{uploaded.fileName}</p>
            </div>
          </section>

          <section className="space-y-4">
            <button
              onClick={handleAnalyze}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
            >
              🤖 Jetzt analysieren
            </button>

            <button
              onClick={handleRetry}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              ← Anderes Foto
            </button>
          </section>
        </main>

        <Navigation />
      </div>
    )
  }

  // ========== UI: ERROR STATE ==========

  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
        <Header userName="Zoey" currentLevel={1} currentXP={25} maxXP={100} />

        <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
          <EliSpeaking mood="thinking" size="lg" message={error || "Hmm, da stimmt was nicht 🤔"} />

          <section className="space-y-4">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
            >
              🔄 Nochmal versuchen
            </button>
          </section>
        </main>

        <Navigation />
      </div>
    )
  }

  return null
}
