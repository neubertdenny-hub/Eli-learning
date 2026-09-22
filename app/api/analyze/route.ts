/**
 * POST /api/analyze
 *
 * Analyzes uploaded document using real OpenAI API with intelligent model routing.
 *
 * Flow:
 * 1. Fetch document from database + Vercel Blob
 * 2. Convert to base64 for OpenAI
 * 3. Call OpenAI with quality-first strategy
 * 4. Auto-escalate if confidence low
 * 5. Validate structured output
 * 6. Save analysis + log usage
 */

import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/db/postgres"
import { getStorage } from "@/lib/storage/blob"
import { getOpenAI } from "@/lib/ai/openai"
import { validateDocumentAnalysis } from "@/lib/ai/schemas"

interface AnalyzeRequest {
  documentId: string
}

interface AnalyzeResponse {
  success: boolean
  documentId?: string
  analysis?: object
  model?: string
  escalated?: boolean
  cost_usd?: number
  latency_ms?: number
  error?: string
}

const ANALYSIS_PROMPT = `
You are an expert mathematics tutor analyzing a student's homework or textbook material.

Analyze the mathematical content in this image/document and provide:

1. **Detected Topics**: What math topics are shown? (e.g., "Bruchrechnung", "Addition")
2. **Mathematical Content**: Type of problem, difficulty level (1-5), required knowledge
3. **Recommended Tasks**: What practice tasks would help with this material
4. **Uncertainty**: If you're unsure about anything, state it clearly

Focus on the MATHEMATICAL CONTENT, not just OCR.

Respond as valid JSON.
`

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    const db = getDatabase()
    const storage = getStorage()
    const openai = getOpenAI()

    // Parse request
    const body: AnalyzeRequest = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Missing documentId" },
        { status: 400 }
      )
    }

    console.log(`[ANALYZE] Starting analysis for: ${documentId}`)

    // ========== FETCH DOCUMENT ==========

    const doc = await db.getDocument(documentId)
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      )
    }

    if (doc.is_deleted) {
      return NextResponse.json(
        { success: false, error: "Document has been deleted" },
        { status: 410 }
      )
    }

    // ========== FETCH FILE FROM BLOB ==========

    console.log(`[ANALYZE] Fetching from Blob: ${doc.storage_key}`)
    const fileBuffer = await storage.downloadFile(doc.storage_key)
    const base64Data = fileBuffer.toString("base64")

    console.log(`[ANALYZE] File size: ${Math.round(fileBuffer.length / 1024)}KB`)

    // ========== OPENAI ANALYSIS ==========

    const mimeType = doc.file_type === "pdf" ? "application/pdf" : "image/jpeg"

    const analysisResponse = await openai.analyzeDocument({
      documentBase64: base64Data,
      documentMimeType: mimeType,
      prompt: ANALYSIS_PROMPT,
    })

    if (!analysisResponse.success) {
      // Save error to database
      await db.updateDocumentAnalysis(documentId, null, "failed")

      // Log failed attempt
      if (doc.user_id) {
        await db.logAIUsage(
          doc.user_id,
          "document_analysis",
          analysisResponse.model,
          analysisResponse.inputTokens,
          analysisResponse.outputTokens,
          0,
          false,
          analysisResponse.error
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: analysisResponse.error,
          model: analysisResponse.model,
          latency_ms: analysisResponse.latencyMs,
        },
        { status: 500 }
      )
    }

    // ========== SAVE TO DATABASE ==========

    await db.updateDocumentAnalysis(documentId, analysisResponse.data, "completed")

    console.log(`[ANALYZE] Analysis complete`)
    console.log(`  Model: ${analysisResponse.model}`)
    console.log(`  Escalated: ${analysisResponse.escalated}`)
    console.log(`  Cost: $${analysisResponse.estimatedCost.toFixed(4)}`)

    // ========== LOG USAGE ==========

    if (doc.user_id) {
      await db.logAIUsage(
        doc.user_id,
        "document_analysis",
        analysisResponse.model,
        analysisResponse.inputTokens,
        analysisResponse.outputTokens,
        analysisResponse.estimatedCost,
        true,
        undefined,
        analysisResponse.latencyMs
      )
    }

    // ========== RESPONSE ==========

    const response: AnalyzeResponse = {
      success: true,
      documentId,
      analysis: analysisResponse.data,
      model: analysisResponse.model,
      escalated: analysisResponse.escalated,
      cost_usd: analysisResponse.estimatedCost,
      latency_ms: analysisResponse.latencyMs,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    const latency = Date.now() - startTime

    console.error("[ANALYZE] Error:", error)

    const response: AnalyzeResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed",
      latency_ms: latency,
    }

    return NextResponse.json(response, { status: 500 })
  }
}
