/**
 * POST /api/generate-help
 *
 * Generiert dynamisch Hilfe-Tipps für beliebige Aufgaben
 * Nutzt OpenAI gpt-4o-mini mit Caching für schnelle Responses
 */

import { NextRequest, NextResponse } from "next/server"
import { getHelpGenerator, type HelpLevel } from "@/lib/learning/dynamic-help-generator"

// In-Memory Cache für diese Session
const helpCache = new Map<string, { levels: HelpLevel[]; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 Stunden

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { problem, solution, helpLevels: requestedLevels } = body

    if (!problem || !solution) {
      return NextResponse.json(
        { error: "problem und solution erforderlich" },
        { status: 400 }
      )
    }

    // Check Cache
    const cacheKey = `${problem}|${solution}`
    const cached = helpCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        helpLevels: cached.levels,
        cached: true,
      })
    }

    // Generiere dynamisch
    const generator = getHelpGenerator()
    const helpLevels = await generator.generateHelp(problem, solution)

    // Cache speichern
    helpCache.set(cacheKey, {
      levels: helpLevels,
      timestamp: Date.now(),
    })

    // Filtere auf angeforderte Levels falls spezifiziert
    const filtered =
      requestedLevels && Array.isArray(requestedLevels)
        ? helpLevels.filter((h) => requestedLevels.includes(h.level))
        : helpLevels

    return NextResponse.json({
      success: true,
      helpLevels: filtered,
      cached: false,
      costEstimate: generator.estimateCost(),
    })
  } catch (error) {
    console.error("Help generation error:", error)
    return NextResponse.json(
      {
        error: "Fehler beim Generieren der Hilfe",
        fallback: true,
        helpLevels: [
          {
            level: 1,
            emoji: "💡",
            hint: "Schau dir die Aufgabe genau an und überlege, welche Regel gilt.",
            explanation: "",
          },
          {
            level: 2,
            emoji: "🧭",
            hint: "Versuche die Aufgabe Schritt für Schritt zu lösen.",
            explanation: "",
          },
          {
            level: 3,
            emoji: "📚",
            hint: "Wenn du nicht weiterkommst, schreib auf, was du bis jetzt weißt.",
            explanation: "",
          },
        ],
      },
      { status: 200 }
    )
  }
}

/**
 * GET /api/generate-help?problem=...&solution=...
 */
export async function GET(request: NextRequest) {
  const problem = request.nextUrl.searchParams.get("problem")
  const solution = request.nextUrl.searchParams.get("solution")

  if (!problem || !solution) {
    return NextResponse.json(
      { error: "problem und solution als Query-Parameter erforderlich" },
      { status: 400 }
    )
  }

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ problem, solution }),
    })
  )
}

/**
 * Cache Statistiken (für Debugging)
 */
export async function GET_STATS(request: NextRequest) {
  if (request.nextUrl.searchParams.get("stats") === "true") {
    return NextResponse.json({
      cacheSize: helpCache.size,
      entries: Array.from(helpCache.entries()).map(([key, value]) => ({
        key: key.substring(0, 50) + "...",
        age: Date.now() - value.timestamp,
      })),
    })
  }
  return GET(request)
}
