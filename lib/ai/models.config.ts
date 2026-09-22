/**
 * OpenAI Model Configuration – Phase 3 (Sept 2026)
 *
 * Quality-first strategy with cost optimization:
 * - Critical tasks (PDFs, handwriting, math reasoning): GPT-6 Astra
 * - Simple tasks (short text, motivation): GPT-5.6 Luna (75× cheaper)
 *
 * Current models (verified Sept 22, 2026):
 * - GPT-6 Astra: $10/$50 per MTok (flagship, best quality)
 * - GPT-5.6 Sol: $4/$20 (professional balance)
 * - GPT-5.6 Terra: $2/$12 (efficient, covers 95% use cases)
 * - GPT-5.6 Luna: $0.20/$1.20 (cost-optimized)
 */

export type UseCase =
  | "document_analysis"
  | "image_analysis"
  | "math_reasoning"
  | "answer_classification"
  | "task_generation"
  | "eli_text_generation"
  | "error_analysis"

export interface ModelConfig {
  model: string
  temperature: number
  max_tokens?: number
  reasoning_effort?: "low" | "medium" | "high" | "max"
}

// ========== PRODUCTION MODELS (Quality First) ==========

const PRODUCTION_MODELS: Record<UseCase, ModelConfig> = {
  // Critical: PDFs, handwriting, school materials
  document_analysis: {
    model: "gpt-6-astra",
    temperature: 0.3,
    max_tokens: 2000,
  },

  // Critical: Photos of math problems, screenshots
  image_analysis: {
    model: "gpt-6-astra",
    temperature: 0.3,
    max_tokens: 1500,
  },

  // Critical: Complex math problems with step-by-step reasoning
  math_reasoning: {
    model: "gpt-6-astra",
    temperature: 0.5,
    max_tokens: 3000,
    reasoning_effort: "high",
  },

  // Critical: Classify if answer is correct, detect error types
  answer_classification: {
    model: "gpt-6-astra",
    temperature: 0.2,
    max_tokens: 1000,
  },

  // Critical: Analyze error patterns, misconceptions
  error_analysis: {
    model: "gpt-6-astra",
    temperature: 0.3,
    max_tokens: 800,
  },

  // Simple: Generate tasks from detected topics
  task_generation: {
    model: "gpt-5.6-terra",
    temperature: 0.7,
    max_tokens: 1500,
  },

  // Simple: Short motivational messages from Eli (75× cheaper)
  eli_text_generation: {
    model: "gpt-5.6-luna",
    temperature: 0.8,
    max_tokens: 150,
  },
}

// ========== DEVELOPMENT MODELS (Cost Optimization) ==========

const DEVELOPMENT_MODELS: Record<UseCase, ModelConfig> = {
  document_analysis: {
    model: "gpt-5.6-terra",
    temperature: 0.3,
    max_tokens: 2000,
  },

  image_analysis: {
    model: "gpt-5.6-terra",
    temperature: 0.3,
    max_tokens: 1500,
  },

  math_reasoning: {
    model: "gpt-5.6-sol",
    temperature: 0.5,
    max_tokens: 3000,
    reasoning_effort: "medium",
  },

  answer_classification: {
    model: "gpt-5.6-luna",
    temperature: 0.2,
    max_tokens: 1000,
  },

  error_analysis: {
    model: "gpt-5.6-luna",
    temperature: 0.3,
    max_tokens: 800,
  },

  task_generation: {
    model: "gpt-5.6-luna",
    temperature: 0.7,
    max_tokens: 1500,
  },

  eli_text_generation: {
    model: "gpt-5.6-luna",
    temperature: 0.8,
    max_tokens: 150,
  },
}

// ========== FALLBACK ESCALATION ==========

export const FALLBACK_CHAIN: Record<string, string> = {
  "gpt-5.6-luna": "gpt-5.6-terra",
  "gpt-5.6-terra": "gpt-5.6-sol",
  "gpt-5.6-sol": "gpt-6-astra",
  "gpt-6-astra": "gpt-6-astra", // No escalation beyond flagship
}

// ========== COST REFERENCE ==========

export const MODEL_COSTS: Record<
  string,
  { inputPerMTok: number; outputPerMTok: number }
> = {
  "gpt-6-astra": { inputPerMTok: 10, outputPerMTok: 50 },
  "gpt-5.6-sol": { inputPerMTok: 4, outputPerMTok: 20 },
  "gpt-5.6-terra": { inputPerMTok: 2, outputPerMTok: 12 },
  "gpt-5.6-luna": { inputPerMTok: 0.2, outputPerMTok: 1.2 },
}

// ========== RUNTIME API ==========

export function getModelConfig(useCase: UseCase): ModelConfig {
  const env = process.env.NODE_ENV || "development"
  const models = env === "production" ? PRODUCTION_MODELS : DEVELOPMENT_MODELS

  const config = models[useCase]
  if (!config) {
    throw new Error(`Unknown use case: ${useCase}`)
  }

  return config
}

export function getModel(useCase: UseCase): string {
  return getModelConfig(useCase).model
}

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model]
  if (!costs) {
    console.warn(`Cost estimation unavailable for model: ${model}`)
    return 0
  }

  const inputCost = (inputTokens / 1_000_000) * costs.inputPerMTok
  const outputCost = (outputTokens / 1_000_000) * costs.outputPerMTok

  return inputCost + outputCost
}

export function getFallbackModel(currentModel: string): string {
  const fallback = FALLBACK_CHAIN[currentModel]
  return fallback || currentModel
}

// ========== VALIDATION ==========

export function validateModelConfig(): void {
  const required = ["OPENAI_API_KEY"]
  const missing = required.filter((v) => !process.env[v])

  if (missing.length > 0) {
    throw new Error(
      `Missing OpenAI config: ${missing.join(", ")}. See .env.example`
    )
  }

  console.log("✓ OpenAI model configuration validated")
  const env = process.env.NODE_ENV || "development"
  console.log(`  Environment: ${env}`)
}
