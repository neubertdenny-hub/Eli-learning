/**
 * OpenAI Task Generator
 *
 * Verwendet OpenAI für:
 * - Task Variants generieren
 * - Altersgerechte Erklärungen
 * - Ähnliche Aufgaben erstellen
 * - Semantische Themenzuordnung
 */

import { SchoolTask } from "./task-selector"

export interface TaskVariantRequest {
  originalTask: string
  difficulty: number // 1-5
  topic: string
  variantCount: number
}

export interface TaskExplanation {
  step1: string
  step2: string
  step3: string
  keyInsight: string
  commonMistake: string
}

export class OpenAITaskGenerator {
  private apiKey: string
  private baseUrl = "https://api.openai.com/v1"
  private model = "gpt-4o-mini" // Cost-optimized

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ""
  }

  /**
   * Generiere Task Varianten basierend auf Original
   *
   * Beispiel Input:
   * "3/5 + 1/5 = ?"
   *
   * Output:
   * ["4/7 + 2/7 = ?", "2/9 + 5/9 = ?", ...]
   */
  async generateTaskVariants(request: TaskVariantRequest): Promise<string[]> {
    if (!this.apiKey) {
      console.warn("OpenAI API key not configured, returning mock variants")
      return this.getMockVariants(request.originalTask, request.variantCount)
    }

    try {
      const prompt = `
Du bist ein Mathematik-Lehrer für 13-jährige Schüler.
Erstelle ${request.variantCount} ähnliche Aufgaben zur Original-Aufgabe.

ORIGINAL AUFGABE:
${request.originalTask}

ANFORDERUNGEN:
- Gleiche mathematische Fähigkeit
- Andere Zahlen/Werte
- Gleiche Schwierigkeit (Level ${request.difficulty})
- Zum Thema: ${request.topic}
- Kein Copy-Paste, echte Varianten
- Altersgerecht und motivierend

ANTWORT: NUR die Aufgaben, eine pro Zeile, KEINE Erklärungen.
`.trim()

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""
      const variants = content
        .split("\n")
        .map((v: string) => v.trim())
        .filter((v: string) => v.length > 0)
        .slice(0, request.variantCount)

      return variants
    } catch (error) {
      console.error("Task variant generation failed:", error)
      return this.getMockVariants(request.originalTask, request.variantCount)
    }
  }

  /**
   * Generiere Step-by-Step Erklärung für Aufgabe
   */
  async generateExplanation(
    problem: string,
    solution: string,
    topic: string
  ): Promise<TaskExplanation | null> {
    if (!this.apiKey) {
      return this.getMockExplanation()
    }

    try {
      const prompt = `
Du erklärst Mathematik für 13-jährige Schüler.
Erkläre diese Aufgabe in EINFACHEN Schritten.

AUFGABE: ${problem}
LÖSUNG: ${solution}
THEMA: ${topic}

Antworte mit JSON (NICHT als Code-Block):
{
  "step1": "Erster Schritt (1-2 Sätze)",
  "step2": "Zweiter Schritt (1-2 Sätze)",
  "step3": "Dritter Schritt (1-2 Sätze)",
  "keyInsight": "Das Wichtigste zum Verstehen (1 Satz)",
  "commonMistake": "Häufiger Fehler, den du vermeiden solltest"
}
`.trim()

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""

      // Parse JSON
      try {
        return JSON.parse(content)
      } catch {
        return this.getMockExplanation()
      }
    } catch (error) {
      console.error("Explanation generation failed:", error)
      return this.getMockExplanation()
    }
  }

  /**
   * Klassifiziere Topic semantisch
   * "Bruchrechnung mit gleichem Nenner addieren" → "addition_same_denominator"
   */
  async classifyTopicSemantics(description: string): Promise<string> {
    if (!this.apiKey) {
      return "general_math"
    }

    try {
      const prompt = `
Klassifiziere dieses Mathe-Thema mit einem kurzen Identifier (snake_case, englisch, max 3 Worte).

THEMA: "${description}"

Antworte NUR mit dem Identifier, z.B.: "fraction_addition_same_denom"
`.trim()

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 50,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content?.trim() || "general_math"
    } catch (error) {
      console.error("Topic classification failed:", error)
      return "general_math"
    }
  }

  /**
   * Mock Variants für Offline/Testing
   */
  private getMockVariants(original: string, count: number): string[] {
    const variants: string[] = []
    for (let i = 0; i < count; i++) {
      // Einfach Zahlen replacen
      const variant = original.replace(/\d+/g, (match) => {
        const num = parseInt(match)
        const newNum = num + (i % 3) - 1 // +1, 0, -1
        return String(Math.max(1, newNum))
      })
      variants.push(variant)
    }
    return variants
  }

  /**
   * Mock Erklärung für Offline
   */
  private getMockExplanation(): TaskExplanation {
    return {
      step1: "Schaue dir die Zahlen genau an.",
      step2: "Wende die richtige Regel an.",
      step3: "Überprüfe dein Ergebnis.",
      keyInsight: "Achte auf die wichtigen Details!",
      commonMistake: "Vorsicht mit Rechenzeichen und Reihenfolge.",
    }
  }

  /**
   * Berechne Token-Kosten (Estimation)
   */
  estimateCost(variantCount: number): number {
    // gpt-4o-mini: ~$0.00015 pro 1K input tokens, ~$0.0006 pro 1K output
    // Durchschnitt: ~200 input tokens pro Request
    // Durchschnitt: ~100 output tokens
    const inputCost = (200 / 1000) * 0.00015
    const outputCost = (100 / 1000) * 0.0006
    return (inputCost + outputCost) * variantCount
  }
}
