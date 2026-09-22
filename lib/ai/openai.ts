/**
 * OpenAI Client with Quality-First Strategy
 *
 * - Critical tasks: GPT-6 Astra (highest quality)
 * - Normal tasks: GPT-5.6 Sol/Terra (balanced)
 * - Simple tasks: GPT-5.6 Luna (cost-optimized)
 * - Auto-escalation when confidence < threshold
 */

import OpenAI from "openai"
import {
  getModelConfig,
  getModel,
  estimateCost,
  FALLBACK_CHAIN,
} from "./models.config"
import {
  validateDocumentAnalysis,
  DocumentAnalysisResult,
  ClassificationResult,
  validateClassification,
} from "./schemas"

type UseCase = "document_analysis" | "image_analysis" | "math_reasoning" | "answer_classification"

interface AnalysisRequest {
  documentUrl?: string
  documentBase64?: string
  documentMimeType?: string
  prompt: string
}

interface AnalysisResponse {
  success: boolean
  data?: DocumentAnalysisResult | ClassificationResult
  model: string
  escalated: boolean
  originalModel?: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  latencyMs: number
  error?: string
}

class OpenAIService {
  private client: any
  private readonly minConfidenceThreshold = 0.7

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }

    this.client = new (OpenAI as any)({ apiKey })
  }

  /**
   * Analyze document (PDF, image) with intelligent model selection
   */
  async analyzeDocument(request: AnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now()
    let useCase: UseCase = "document_analysis"
    let currentModel = getModel(useCase)
    let escalated = false
    let originalModel = currentModel

    try {
      console.log(`[OpenAI] Analyzing document with ${currentModel}`)

      // Build message content
      const content = this.buildMessageContent(request)

      // First attempt with configured model
      let response = await this.callOpenAI(currentModel, content, useCase)

      // Check confidence and escalate if needed
      if (!response.success && response.shouldEscalate) {
        console.log(`[OpenAI] Low confidence (${response.confidence}). Escalating to stronger model.`)

        const escalatedModel = FALLBACK_CHAIN[currentModel]
        if (escalatedModel && escalatedModel !== currentModel) {
          escalated = true
          currentModel = escalatedModel

          response = await this.callOpenAI(currentModel, content, useCase)
        }
      }

      if (!response.success) {
        throw new Error(`Analysis failed: ${response.error}`)
      }

      const latency = Date.now() - startTime

      return {
        success: true,
        data: response.data,
        model: currentModel,
        escalated,
        originalModel: escalated ? originalModel : undefined,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        estimatedCost: estimateCost(
          currentModel,
          response.inputTokens,
          response.outputTokens
        ),
        latencyMs: latency,
      }
    } catch (error) {
      const latency = Date.now() - startTime

      console.error(`[OpenAI] Error during analysis:`, error)

      return {
        success: false,
        model: currentModel,
        escalated,
        originalModel: escalated ? originalModel : undefined,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        latencyMs: latency,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Classify if an answer is correct (with error detection)
   */
  async classifyAnswer(
    problemStatement: string,
    correctSolution: string,
    userAnswer: string
  ): Promise<AnalysisResponse> {
    const startTime = Date.now()
    const useCase: UseCase = "answer_classification"
    const currentModel = getModel(useCase)

    try {
      const prompt = `
You are a mathematics tutor evaluating a student's answer.

Problem: ${problemStatement}

Correct Solution: ${correctSolution}

Student's Answer: ${userAnswer}

Analyze if the answer is correct and identify any errors. Be specific about error types.
      `

      const response = await this.callOpenAI(
        currentModel,
        [{ type: "text", text: prompt }],
        useCase
      )

      if (!response.success) {
        throw new Error(response.error)
      }

      const latency = Date.now() - startTime

      return {
        success: true,
        data: response.data,
        model: currentModel,
        escalated: false,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        estimatedCost: estimateCost(
          currentModel,
          response.inputTokens,
          response.outputTokens
        ),
        latencyMs: latency,
      }
    } catch (error) {
      const latency = Date.now() - startTime

      return {
        success: false,
        model: currentModel,
        escalated: false,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        latencyMs: latency,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Generate simple Eli motivation text (cheap fast model)
   */
  async generateEliText(prompt: string): Promise<string> {
    try {
      const model = "gpt-5.6-luna" // Always use fast model for this

      const response = await this.client.messages.create({
        model,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const text =
        response.content[0]?.type === "text" ? response.content[0].text : ""
      return text.substring(0, 150) // Ensure under limit
    } catch (error) {
      console.error(`[OpenAI] Generate text failed:`, error)
      return "Great effort, Zoey! Keep practicing! 🌟"
    }
  }

  // ========== PRIVATE HELPERS ==========

  private buildMessageContent(request: AnalysisRequest): any {
    if (request.documentBase64) {
      // Image in base64
      return [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: (request.documentMimeType || "image/jpeg") as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: request.documentBase64,
          },
        },
        {
          type: "text",
          text: request.prompt,
        },
      ]
    } else if (request.documentUrl) {
      // Image from URL
      return [
        {
          type: "image",
          source: {
            type: "url",
            url: request.documentUrl,
          },
        },
        {
          type: "text",
          text: request.prompt,
        },
      ]
    } else {
      // Text only
      return request.prompt
    }
  }

  private async callOpenAI(
    model: string,
    content: any,
    useCase: UseCase
  ): Promise<{
    success: boolean
    data?: any
    confidence?: number
    shouldEscalate?: boolean
    inputTokens: number
    outputTokens: number
    error?: string
  }> {
    try {
      const config = getModelConfig(useCase)

      const response = await this.client.messages.create({
        model,
        max_tokens: config.max_tokens || 1000,
        temperature: config.temperature,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      })

      const text =
        response.content[0]?.type === "text" ? response.content[0].text : ""

      // Try to parse as JSON
      let data: any = null
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0])

          // Validate against schema
          if (useCase === "document_analysis") {
            data = validateDocumentAnalysis(data)
          } else if (useCase === "answer_classification") {
            data = validateClassification(data)
          }
        }
      } catch (error) {
        console.warn(`[OpenAI] Failed to parse response as JSON:`, error)
      }

      return {
        success: true,
        data,
        confidence: data?.confidence || 1,
        shouldEscalate: data?.confidence && data.confidence < this.minConfidenceThreshold,
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
      }
    } catch (error) {
      console.error(`[OpenAI] API call failed:`, error)
      return {
        success: false,
        inputTokens: 0,
        outputTokens: 0,
        error: error instanceof Error ? error.message : "API call failed",
      }
    }
  }
}

// Singleton
let openaiInstance: OpenAIService | null = null

export function getOpenAI(): OpenAIService {
  if (!openaiInstance) {
    openaiInstance = new OpenAIService()
  }
  return openaiInstance
}

export type { AnalysisRequest, AnalysisResponse }
