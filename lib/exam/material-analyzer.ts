/**
 * Phase 7B: Material Analysis
 * OpenAI analysiert hochgeladene Materialien und erkennt Prüfungsthemen
 */

import { getVisionAnalysis } from "@/lib/ai/vision-client"

export interface AnalysisResult {
  topics: AnalyzedTopic[]
  confidence: number // 0-1: Wie sicher ist die Gesamtanalyse
  rawAnalysis: string
  materialType: "WORKSHEET" | "CHEAT_SHEET" | "TEXTBOOK" | "NOTEBOOK" | "OTHER"
}

export interface AnalyzedTopic {
  topicName: string           // z.B. "Bruchrechnung"
  subtopics: string[]         // z.B. ["Brüche kürzen", "Brüche addieren"]
  sourceType: "CONFIRMED" | "LIKELY" | "FOUNDATION"
  confidence: number          // 0-1
  reasoning: string           // Warum diese Kategorie?
  examples?: string[]         // Beispiele aus Material
}

/**
 * Analyse-Prompt für OpenAI
 */
const ANALYSIS_PROMPT = `Du bist ein erfahrener Mathematik-Lehrer. Analysiere das hochgeladene Material (Stoffzettel, Arbeitsblatt, Schulbuch oder Hefteintrag) für eine Klassenarbeit.

WICHTIG - Drei Kategorien:

1. CONFIRMED: Thema ist eindeutig im Material vorhanden
2. LIKELY: Thema ergibt sich wahrscheinlich aus mehreren Hinweisen
3. FOUNDATION: Thema steht NICHT im Material, wird aber als mathematische Grundlage benötigt

NIEMALS erfinde Themen die nicht im Material sind.

Antworte im JSON-Format:
{
  "topics": [
    {
      "topicName": "Bruchrechnung",
      "subtopics": ["Brüche kürzen", "Brüche addieren"],
      "sourceType": "CONFIRMED",
      "confidence": 0.95,
      "reasoning": "Mehrfach erwähnt und mit Übungsaufgaben",
      "examples": ["Aufgabe 1-5: Brüche addieren"]
    },
    {
      "topicName": "Kleines Einmaleins",
      "subtopics": ["Grundlagen"],
      "sourceType": "FOUNDATION",
      "confidence": 0.8,
      "reasoning": "Nötig um Brüche zu kürzen",
      "examples": []
    }
  ],
  "materialType": "WORKSHEET",
  "overallConfidence": 0.85,
  "materialDescription": "Arbeitsblatt mit Übungen zu Bruchrechnung"
}`;

/**
 * Analysiere hochgeladene Datei mit OpenAI Vision
 */
export async function analyzeExamMaterial(
  documentUrl: string,
  materialType: "WORKSHEET" | "CHEAT_SHEET" | "TEXTBOOK" | "NOTEBOOK" | "OTHER"
): Promise<AnalysisResult> {
  try {
    const analysis = await getVisionAnalysis({
      imageUrl: documentUrl,
      prompt: ANALYSIS_PROMPT,
      model: "gpt-4o", // Starkes Modell für komplexe Dokumentenanalyse
    })

    if (!analysis) {
      throw new Error("No analysis returned from Vision API")
    }

    // Parse OpenAI response
    let parsed: any
    try {
      // Extract JSON from response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      parsed = JSON.parse(jsonMatch[0])
    } catch (e) {
      console.error("Failed to parse analysis JSON:", e)
      throw new Error("Invalid analysis response format")
    }

    const result: AnalysisResult = {
      topics: parsed.topics.map((t: any) => ({
        topicName: t.topicName,
        subtopics: t.subtopics || [],
        sourceType: t.sourceType,
        confidence: Math.min(1, Math.max(0, t.confidence)),
        reasoning: t.reasoning,
        examples: t.examples || [],
      })),
      confidence: Math.min(1, Math.max(0, parsed.overallConfidence || 0.7)),
      rawAnalysis: analysis,
      materialType,
    }

    return result
  } catch (error) {
    console.error("Material analysis failed:", error)
    throw error
  }
}

/**
 * Bestimme Material Type aus Filename
 */
export function inferMaterialType(fileName: string): "WORKSHEET" | "CHEAT_SHEET" | "TEXTBOOK" | "NOTEBOOK" | "OTHER" {
  const lower = fileName.toLowerCase()

  if (lower.includes("stoff") || lower.includes("übersicht")) return "CHEAT_SHEET"
  if (lower.includes("arbeitsblatt")) return "WORKSHEET"
  if (lower.includes("buch") || lower.includes("seite")) return "TEXTBOOK"
  if (lower.includes("heft") || lower.includes("notizbuch")) return "NOTEBOOK"

  return "OTHER"
}

/**
 * Low Confidence Topics - sollte User bestätigen
 */
export function getLowConfidenceTopics(topics: AnalyzedTopic[], threshold = 0.7): AnalyzedTopic[] {
  return topics.filter(t => t.confidence < threshold)
}

/**
 * Confidence Summary
 */
export function summarizeAnalysisConfidence(topics: AnalyzedTopic[]): string {
  const confirmed = topics.filter(t => t.sourceType === "CONFIRMED").length
  const likely = topics.filter(t => t.sourceType === "LIKELY").length
  const foundation = topics.filter(t => t.sourceType === "FOUNDATION").length
  const lowConf = topics.filter(t => t.confidence < 0.7).length

  if (lowConf === 0) {
    return `✅ ${confirmed} bestätigt, ${likely} wahrscheinlich, ${foundation} Grundlagen`
  } else {
    return `⚠️ ${lowConf} Thema(ta) unsicher - bitte bestätigen`
  }
}
