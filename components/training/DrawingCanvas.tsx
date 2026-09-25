"use client"

import React, { useRef, useEffect, useState } from "react"
import { MathSymbolCanvas, recognizeMathSymbol, type SymbolPrediction } from "@/lib/learning/math-symbol-recognition"

// Adapt SymbolPrediction to RecognitionResult interface
interface RecognitionResult {
  recognized_text: string
  confidence: number
  alternatives: string[]
  is_equation: boolean
  recognized_elements: Array<any>
}

export interface DrawingCanvasProps {
  onRecognition: (result: RecognitionResult) => void
  onClose: () => void
  onSubmit?: () => void
  taskQuestion?: string
}

export function DrawingCanvas({ onRecognition, onClose, onSubmit, taskQuestion }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mathSymbolCanvas, setMathSymbolCanvas] = useState<MathSymbolCanvas | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const [useTyping, setUseTyping] = useState(isMobile) // Mobile: default to typing
  const [typedText, setTypedText] = useState("")

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new MathSymbolCanvas(canvasRef.current)
    setMathSymbolCanvas(canvas)

    return () => {
      canvas.clearCanvas()
    }
  }, [])

  const handleSubmit = async () => {
    if (!mathSymbolCanvas) return

    setIsProcessing(true)
    const drawing = mathSymbolCanvas.getDrawing()

    try {
      const prediction = await recognizeMathSymbol(drawing)
      const result: RecognitionResult = {
        recognized_text: prediction.symbol,
        confidence: prediction.confidence,
        alternatives: [],
        is_equation: false,
        recognized_elements: [],
      }
      setRecognitionResult(result)
      onRecognition(result)
    } catch (error) {
      console.error("Recognition failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    if (mathSymbolCanvas) {
      mathSymbolCanvas.clearCanvas()
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

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-gray-100 p-2 rounded-lg">
          <button
            onClick={() => setUseTyping(false)}
            className={`flex-1 py-2 rounded font-bold transition-colors text-sm ${
              !useTyping
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ✍️ Handschrift
          </button>
          <button
            onClick={() => setUseTyping(true)}
            className={`flex-1 py-2 rounded font-bold transition-colors text-sm ${
              useTyping
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ⌨️ Tippen
          </button>
        </div>

        {/* Canvas or Typing Area */}
        {!useTyping ? (
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
        ) : (
          <textarea
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Schreib deinen Rechenweg hier..."
            className="w-full border-3 border-blue-300 rounded-lg p-4 flex-1 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

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
        <div className="flex flex-col gap-3 sm:flex-row">
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

          {useTyping && typedText ? (
            <button
              onClick={() => {
                onRecognition({
                  recognized_text: typedText,
                  confidence: 1.0,
                  alternatives: [],
                  is_equation: false,
                  recognized_elements: [],
                })
                onClose()
                onSubmit?.()
              }}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              ✅ Übernehmen & Abschließen
            </button>
          ) : recognitionResult && !useTyping ? (
            <button
              onClick={() => {
                onRecognition(recognitionResult)
                onClose()
                onSubmit?.()
              }}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              ✅ Übernehmen & Abschließen
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
