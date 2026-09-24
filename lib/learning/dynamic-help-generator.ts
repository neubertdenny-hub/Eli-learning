/**
 * Dynamic Help Generator
 *
 * Generiert für JEDE Aufgabe automatisch Hilfe-Tipps auf 3 Levels
 * Nutzt OpenAI für echtes Verständnis, nicht hardcodierte Rules
 */

export interface HelpLevel {
  level: 1 | 2 | 3
  hint: string
  emoji: string
  explanation: string
}

export interface DynamicHelp {
  problem: string
  solution: string
  helpLevels: HelpLevel[]
  generatedAt: Date
}

export class DynamicHelpGenerator {
  private apiKey: string
  private baseUrl = "https://api.openai.com/v1"
  private model = "gpt-4o-mini"
  private cache: Map<string, DynamicHelp> = new Map()

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ""
  }

  /**
   * Generiere 3-Level Hilfe für beliebige Aufgabe
   * Level 1: Kleiner Tipp (nicht zu viel verraten)
   * Level 2: Richtung (Methode zeigen)
   * Level 3: Erklärung (Volle Lösung mit Schritten)
   */
  async generateHelp(problem: string, solution: string): Promise<HelpLevel[]> {
    // Prüfe Cache
    const cacheKey = `${problem}|${solution}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.helpLevels
    }

    if (!this.apiKey) {
      // Fallback wenn API Key nicht vorhanden
      return this.generateFallbackHelp(problem, solution)
    }

    try {
      const prompt = `
Du bist ein GEDULDIG und AUSFÜHRLICH erklärter Mathe-Lehrer für 13-jährige Schüler.
WICHTIG: Schreib LANG und DETAILLIERT für JEDES Level! Nicht kurz!

AUFGABE: ${problem}
LÖSUNG: ${solution}

Generiere EXAKT diese JSON-Struktur mit AUSFÜHRLICHEN Erklärungen:
{
  "level1": {
    "emoji": "💡",
    "hint": "Ein hilfreicher Tipp (3-4 Sätze), der NICHT die Antwort verrät. Erkläre die Intuition!"
  },
  "level2": {
    "emoji": "🧭",
    "hint": "Ausführliche Richtung/Methode (4-6 Sätze). Zeige den Weg mit Beispielen, aber nicht die komplette Lösung."
  },
  "level3": {
    "emoji": "📚",
    "hint": "SEHR ausführliche Erklärung mit ALLEN Schritten und Beispiel (6-8 Sätze). Erkläre auch das WARUM!"
  }
}

ANFORDERUNGEN für ALLE Level:
- Schreib AUSFÜHRLICH und KLAR, nicht kurz!
- MINDESTENS die angegebene Satzanzahl!
- Altersgerecht für 13-jährige (nicht zu einfach, nicht zu komplex)
- Verwende konkrete Zahlenbeispiele
- Erkläre das WARUM, nicht nur das WIE
- Deutsche Sprache
- Diese Richtlinie gilt auch für ALLE zukünftigen/neuen Aufgabentypen!

Schreib JETZT die ausführlichen Tipps:
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
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ""

      // Parse JSON aus Antwort
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return this.generateFallbackHelp(problem, solution)
      }

      const parsed = JSON.parse(jsonMatch[0])

      const helpLevels: HelpLevel[] = [
        {
          level: 1,
          emoji: parsed.level1?.emoji || "💡",
          hint: parsed.level1?.hint || "Schau dir die Aufgabe genau an",
          explanation: parsed.level1?.hint || "",
        },
        {
          level: 2,
          emoji: parsed.level2?.emoji || "🧭",
          hint: parsed.level2?.hint || "Versuche die Methode zu erkennen",
          explanation: parsed.level2?.hint || "",
        },
        {
          level: 3,
          emoji: parsed.level3?.emoji || "📚",
          hint: parsed.level3?.hint || `Die Lösung ist: ${solution}`,
          explanation: parsed.level3?.hint || "",
        },
      ]

      // Cache
      this.cache.set(cacheKey, {
        problem,
        solution,
        helpLevels,
        generatedAt: new Date(),
      })

      return helpLevels
    } catch (error) {
      console.error("Help generation failed:", error)
      return this.generateFallbackHelp(problem, solution)
    }
  }

  /**
   * Fallback: Generische Hilfe wenn OpenAI nicht verfügbar
   */
  private generateFallbackHelp(problem: string, solution: string): HelpLevel[] {
    return [
      {
        level: 1,
        emoji: "💡",
        hint: `Tipp: Schau dir alle Zahlen und Symbole in der Aufgabe genau an. "${problem}" - was bedeuten sie?`,
        explanation: "",
      },
      {
        level: 2,
        emoji: "🧭",
        hint: `Richtung: Versuche die Aufgabe in Schritte zu zerlegen. Schreib jeden Schritt einzeln auf.`,
        explanation: "",
      },
      {
        level: 3,
        emoji: "📚",
        hint: `Erklärung: Die Aufgabe ist "${problem}". Die richtige Methode führt zur Lösung: ${solution}. Versuche es selbst!`,
        explanation: "",
      },
    ]
  }

  /**
   * Formatiere Help für UI-Anzeige
   */
  formatHelpMessage(helpLevel: HelpLevel): string {
    return `${helpLevel.emoji} ${helpLevel.hint}`
  }

  /**
   * Leere Cache wenn nötig
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Berechne OpenAI Kosten (Estimation)
   */
  estimateCost(): number {
    // ~400 Tokens pro Help-Generation
    // gpt-4o-mini: ~$0.00015 pro 1K input, ~$0.0006 pro 1K output
    const avgTokens = 400
    const costPerMThousand = 0.00015 + 0.0006
    return (avgTokens / 1000) * costPerMThousand
  }
}

// Singleton Instance
let generator: DynamicHelpGenerator | null = null

export function getHelpGenerator(): DynamicHelpGenerator {
  if (!generator) {
    generator = new DynamicHelpGenerator()
  }
  return generator
}
