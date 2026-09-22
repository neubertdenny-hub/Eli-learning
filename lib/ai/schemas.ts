/**
 * Structured Output Schemas for OpenAI API responses
 * Ensures AI responses are validated and type-safe
 */

import { z } from "zod"

// ========== DOCUMENT ANALYSIS SCHEMA ==========

export const DetectedTopicSchema = z.object({
  topic_name: z.string().describe("Main topic (e.g., 'Bruchrechnung')"),
  subtopic_name: z.string().optional().describe("Subtopic (e.g., 'Addition')"),
  confidence: z.number().min(0).max(1).describe("Confidence 0-1"),
  key_concepts: z.array(z.string()).describe("Key concepts involved"),
})

export const MathematicalContentSchema = z.object({
  problem_type: z.enum([
    "arithmetic",
    "algebra",
    "geometry",
    "statistics",
    "other",
  ]).describe("Type of math problem"),
  difficulty_level: z.number().min(1).max(5).describe("Difficulty 1-5"),
  required_knowledge: z.array(z.string()).describe("Prerequisites needed"),
  key_skills: z.array(z.string()).describe("Skills being tested"),
  error_prone_areas: z.array(z.string()).describe("Common mistake areas"),
})

export const RecommendedTaskSchema = z.object({
  title: z.string().describe("Task title"),
  description: z.string().describe("Brief description"),
  difficulty_level: z.number().min(1).max(5),
  estimated_time_minutes: z.number().min(5).max(60),
})

export const DocumentAnalysisResultSchema = z.object({
  confidence: z.number().min(0).max(1).describe("Overall analysis confidence"),
  detected_topics: z.array(DetectedTopicSchema),
  mathematical_content: MathematicalContentSchema,
  recommended_tasks: z.array(RecommendedTaskSchema),
  uncertainty_notes: z
    .array(z.string())
    .optional()
    .describe("Things we're unsure about"),
  raw_text: z.string().optional().describe("OCR text if applicable"),
})

// ========== CLASSIFICATION SCHEMA ==========

export const HelpSuggestionSchema = z.object({
  help_level: z.number().min(0).max(5).describe("Help level 0-5"),
  intervention_type: z.enum(["hint", "step_by_step", "explain_concept", "similar_problem"]),
  suggestion_text: z.string().describe("Actual help text for Eli"),
})

export const ClassificationResultSchema = z.object({
  is_correct: z.boolean().describe("Is the answer mathematically correct?"),
  confidence: z.number().min(0).max(1).describe("Confidence in classification"),
  error_type: z
    .enum([
      "sign_error",
      "calculation_error",
      "conceptual_misunderstanding",
      "procedural_error",
      "careless_mistake",
      "incomplete_solution",
      "notation_error",
    ])
    .optional()
    .describe("Type of error if incorrect"),
  explanation: z.string().describe("Why this answer is correct/incorrect"),
  help_suggestion: HelpSuggestionSchema.optional(),
})

// ========== TASK GENERATION SCHEMA ==========

export const TaskGenerationResultSchema = z.object({
  title: z.string().describe("Task title"),
  problem_statement: z.string().describe("The actual problem Zoey solves"),
  solution: z.string().describe("Correct solution"),
  solution_steps: z.array(
    z.object({
      step_number: z.number(),
      description: z.string(),
      explanation: z.string(),
      visual_hint: z.string().optional(),
    })
  ),
  difficulty_level: z.number().min(1).max(5),
  category: z.enum(["calculation", "problem_solving", "conceptual"]),
})

// ========== ELI TEXT GENERATION SCHEMA ==========

export const EliTextSchema = z.object({
  message: z.string().describe("Eli's encouraging/helpful message (max 100 chars)"),
  mood: z
    .enum(["happy", "explaining", "encouraging", "thinking"])
    .optional()
    .describe("Mood state for Eli robot"),
})

// ========== TYPE INFERENCE ==========

export type DocumentAnalysisResult = z.infer<
  typeof DocumentAnalysisResultSchema
>
export type ClassificationResult = z.infer<
  typeof ClassificationResultSchema
>
export type TaskGenerationResult = z.infer<
  typeof TaskGenerationResultSchema
>
export type EliText = z.infer<typeof EliTextSchema>

// ========== VALIDATION & RUNTIME CHECKING ==========

/**
 * Safely parse and validate structured output from OpenAI
 * Throws detailed error if validation fails
 */
export function validateDocumentAnalysis(
  data: unknown
): DocumentAnalysisResult {
  try {
    return DocumentAnalysisResultSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")
      throw new Error(`Document analysis validation failed: ${issues}`)
    }
    throw error
  }
}

export function validateClassification(
  data: unknown
): ClassificationResult {
  try {
    return ClassificationResultSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")
      throw new Error(`Classification validation failed: ${issues}`)
    }
    throw error
  }
}

export function validateTaskGeneration(
  data: unknown
): TaskGenerationResult {
  try {
    return TaskGenerationResultSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")
      throw new Error(`Task generation validation failed: ${issues}`)
    }
    throw error
  }
}

export function validateEliText(data: unknown): EliText {
  try {
    return EliTextSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")
      throw new Error(`Eli text validation failed: ${issues}`)
    }
    throw error
  }
}
