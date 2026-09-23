import { NextRequest, NextResponse } from "next/server"
import { validateClassification } from "@/lib/ai/schemas"

const SYSTEM_PROMPT = `Du bist ELI, die mathematische Bewertungs- und Hilfe-Engine für Zoey (12 Jahre).

Deine Aufgabe: Klassifiziere Zoeys Antwort auf eine mathematische Aufgabe in eine der 6 Kategorien:

**Kategorie A – RICHTIG**
Ergebnis UND Rechenweg sind korrekt.
confidence: 0.95-1.0

**Kategorie B – KLEINER FEHLER**
Zoey versteht das Prinzip, aber hat einen kleinen Fehler gemacht:
- Zahlendreher
- Kleine Rechenfehler
- Vorzeichen übersehen
- Flüchtigkeitsfehler
confidence: 0.80-0.95

**Kategorie C – MITTLERER FEHLER**
Ein bestimmter Rechenschritt wurde nicht verstanden.
confidence: 0.70-0.85

**Kategorie D – FOUNDATION GAP**
Das eigentliche Problem liegt in einer mathematischen Grundlage.
Beispiel: Thema ist Gleichungen, aber Problem liegt bei negativen Dezimalzahlen.
confidence: 0.70-0.85

**Kategorie E – PROBLEM NICHT VERSTANDEN**
Zoey versteht die Aufgabenstellung sprachlich nicht.
confidence: 0.60-0.85

**Kategorie F – UNSICHERE ERKENNUNG**
Die handschriftliche Eingabe oder das Bild ist unklar.
Nicht raten - das System sollte fragen.
confidence: 0.30-0.70

---

WICHTIG:

1. Gib IMMER eine help_suggestion mit einem konkreten Text, der Eli sagen kann.
2. Die Hilfe-Vorschläge müssen SEHR KURZ sein (max. 150 Zeichen).
3. Erklärungen müssen KIND-FREUNDLICH sein.
4. Für Kategorie D: Erkenne und liste die foundation_gaps auf (z.B. 'negative_numbers', 'decimal_arithmetic').
5. Für Kategorie B: Der Hinweis soll das Problem hinterfragen, aber NICHT die Lösung verraten.
6. Confidence muss ehrlich sein - wenn unsicher, niedriger werten.

Antworte nur mit gültigem JSON gemäß ClassificationResultSchema.`

interface ClassificationRequest {
  problem_statement: string
  user_answer: string
  correct_solution?: string
  solution_steps?: string
  topic?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ClassificationRequest = await request.json()

    const { problem_statement, user_answer, correct_solution, solution_steps, topic } = body

    if (!problem_statement || !user_answer) {
      return NextResponse.json(
        { error: "Missing problem_statement or user_answer" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Erstelle die Prompt für Klassifizierung
    const userPrompt = `
Aufgabe: "${problem_statement}"

Zoeys Antwort: "${user_answer}"

${correct_solution ? `Richtige Lösung: "${correct_solution}"` : ""}
${solution_steps ? `Lösungsschritte: ${solution_steps}` : ""}
${topic ? `Thema: ${topic}` : ""}

Klassifiziere diese Antwort und gib help_suggestion.`

    // Rufe OpenAI mit Structured Output auf
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "classification_result",
            schema: {
              type: "object",
              properties: {
                classification: {
                  type: "string",
                  enum: ["A", "B", "C", "D", "E", "F"],
                },
                is_correct: { type: "boolean" },
                confidence: { type: "number" },
                error_type: { type: "string" },
                foundation_gaps: {
                  type: "array",
                  items: { type: "string" },
                },
                explanation: { type: "string" },
                help_suggestion: {
                  type: "object",
                  properties: {
                    help_level: { type: "number" },
                    intervention_type: { type: "string" },
                    suggestion_text: { type: "string" },
                    require_reprompt: { type: "boolean" },
                  },
                  required: ["help_level", "intervention_type", "suggestion_text"],
                },
              },
              required: ["classification", "is_correct", "confidence", "explanation"],
            },
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: "Classification failed", details: error },
        { status: 500 }
      )
    }

    const data = await response.json()
    const result = data.choices[0]?.message?.content

    if (!result) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      )
    }

    // Parse JSON-String
    const parsed = JSON.parse(result)

    // Validiere gegen Schema
    const validated = validateClassification(parsed)

    // Speichere in DB (in Phase 4B)
    // Für jetzt: Rückgabe
    return NextResponse.json(validated)
  } catch (error) {
    console.error("Classification API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
