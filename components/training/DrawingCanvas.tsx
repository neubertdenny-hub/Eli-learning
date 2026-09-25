"use client"

import React, { useRef, useEffect, useState } from "react"
import { HandwritingCanvas, recognizeHandwriting, RecognitionResult } from "@/lib/learning/handwriting-input"

export interface DrawingCanvasProps {
  onRecognition: (result: RecognitionResult) => void
  onClose: () => void
  taskQuestion?: string
}

export function DrawingCanvas({ onRecognition, onClose, taskQuestion }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [handwritingCanvas, setHandwritingCanvas] = useState<HandwritingCanvas | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new HandwritingCanvas(canvasRef.current)
    setHandwritingCanvas(canvas)

    return () => {
      canvas.clearCanvas()
    }
  }, [])

  const handleSubmit = async () => {
    if (!handwritingCanvas) return

    setIsProcessing(true)
    const drawing = handwritingCanvas.getDrawing()

    try {
      const result = await recognizeHandwriting(drawing)
      setRecognitionResult(result)
      onRecognition(result)
    } catch (error) {
      console.error("Recognition failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    if (handwritingCanvas) {
      handwritingCanvas.clearCanvas()
      setRecognitionResult(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full h-screen sm:h-auto sm:max-w-2xl sm:max-h-screen flex flex-col space-y-4 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">✍️ Schreib deinen Rechenweg</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Task Question */}
        {taskQuestion && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <p className="text-sm text-gray-600">Aufgabe:</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{taskQuestion}</p>
          </div>
        )}

        {/* Canvas */}
        <div className="border-3 border-blue-300 rounded-lg overflow-hidden bg-white flex-1 min-h-64 sm:min-h-96 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none absolute inset-0"
            style={{
              display: "block",
              touchAction: "none",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
            }}
          />
        </div>

        {/* Recognition Result */}
        {recognitionResult && (
          <div className={`p-4 rounded-lg ${
            recognitionResult.confidence > 0.8
              ? "bg-green-100 border-2 border-green-400"
              : recognitionResult.confidence > 0.5
              ? "bg-yellow-100 border-2 border-yellow-400"
              : "bg-red-100 border-2 border-red-400"
          }`}>
            <p className="font-bold text-gray-900">
              Erkannt: <span className="text-xl sm:text-2xl">{recognitionResult.recognized_text}</span>
            </p>
            <p className="text-sm text-gray-600">
              Konfidenz: {Math.round(recognitionResult.confidence * 100)}%
            </p>
            {recognitionResult.confidence < 0.6 && (
              <p className="text-sm text-red-700 mt-2">
                ⚠️ Zu unsicher - bitte deutlicher schreiben oder nochmal versuchen
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            🗑️ {recognitionResult ? "Nochmal" : "Löschen"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !recognitionResult}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            {isProcessing ? "⏳ Erkenne..." : recognitionResult ? "✅ OK" : "📝 Schreib & Erkenne"}
          </button>
        </div>
      </div>
    </div>
  )
}
