/**
 * POST /api/generate-solution
 *
 * Generiert einen detaillierten Lösungsweg für mathematische Aufgaben
 * Liest die Aufgabe, erklärt jeden Schritt und zeigt die Lösung
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { problem, expectedAnswer, difficulty } = body

    if (!problem) {
      return NextResponse.json(
        { error: "problem erforderlich" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    // Wenn kein API Key, verwende intelligenten Fallback
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        solution: getFallbackSolution(problem, expectedAnswer, difficulty),
        isAI: false,
      })
    }

    // OpenAI Request
    try {
      const prompt = `
Du bist ein Mathe-Lehrer für 13-jährige Schüler. Erklär diese Aufgabe SUPER verständlich mit allen Schritten.

AUFGABE: ${problem}
ERGEBNIS: ${expectedAnswer || "?"}
SCHWIERIGKEIT: ${difficulty || "mittel"}

Gib eine Erklärung im Format:
📍 SCHRITT 1: [Erster Rechenschritt mit Erklärung]
📍 SCHRITT 2: [Zweiter Rechenschritt mit Erklärung]
📍 SCHRITT 3: [etc...]
✅ LÖSUNG: [Finales Ergebnis]
💡 MERKSATZ: [Ein Satz zum Merken]

Macht alles altersgerecht, konkret und verständlich!
`.trim()

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      })

      if (!response.ok) {
        console.error("OpenAI error:", response.status)
        return NextResponse.json({
          success: true,
          solution: getFallbackSolution(problem, expectedAnswer, difficulty),
          isAI: false,
        })
      }

      const data = await response.json()
      const solution = data.choices[0]?.message?.content || ""

      return NextResponse.json({
        success: true,
        solution: solution || getFallbackSolution(problem, expectedAnswer, difficulty),
        isAI: true,
      })
    } catch (aiError) {
      console.error("AI generation error:", aiError)
      return NextResponse.json({
        success: true,
        solution: getFallbackSolution(problem, expectedAnswer, difficulty),
        isAI: false,
      })
    }
  } catch (error) {
    console.error("Solution generation error:", error)
    return NextResponse.json(
      { error: "Fehler beim Generieren der Lösung" },
      { status: 500 }
    )
  }
}

/**
 * Intelligenter Fallback: Analysiert die Aufgabe selbst
 */
function getFallbackSolution(
  problem: string,
  expectedAnswer: string | undefined,
  difficulty: string | undefined
): string {
  const q = problem.toLowerCase()

  // Erkenne Aufgaben-Typ und generiere Erklärung
  if (q.includes("+") && !q.includes("(")) {
    const match = problem.match(/(\d+)\s*\+\s*(\d+)/)
    if (match) {
      const [, a, b] = match
      const num1 = parseInt(a)
      const num2 = parseInt(b)
      const sum = num1 + num2

      if (num1 > 50 || num2 > 50) {
        return `📍 SCHRITT 1: Schreib die Zahlen untereinander
  ${num1}
 +${num2}
------

📍 SCHRITT 2: Addiere von rechts (Einer):
  ${num1 % 10} + ${num2 % 10} = ${(num1 % 10) + (num2 % 10)}

📍 SCHRITT 3: Addiere Zehner, dann Hunderter (wie Einer)

✅ LÖSUNG: ${sum}

💡 MERKSATZ: "Spaltenweise addieren: immer von rechts nach links!"`
      }

      return `📍 SCHRITT 1: Erkenne die Aufgabe: ${num1} + ${num2}

📍 SCHRITT 2: Zähle weiter:
  Start: ${num1}
  +1: ${num1 + 1}
  +2: ${num1 + 2}
  ... insgesamt ${num2} Schritte

✅ LÖSUNG: ${sum}

💡 MERKSATZ: "Addition = von der ersten Zahl aus weiterzählen!"`
    }
  }

  if ((q.includes("-") || q.includes("−")) && !q.includes("(")) {
    const match = problem.match(/(\d+)\s*[-−]\s*(\d+)/)
    if (match) {
      const [, a, b] = match
      const num1 = parseInt(a)
      const num2 = parseInt(b)
      const diff = num1 - num2

      return `📍 SCHRITT 1: Erkenne: ${num1} - ${num2}

📍 SCHRITT 2: Zähle zurück:
  Start: ${num1}
  -1: ${num1 - 1}
  -2: ${num1 - 2}
  ... insgesamt ${num2} Schritte zurück

✅ LÖSUNG: ${diff}

💡 MERKSATZ: "Subtraktion = vom Start aus rückwärtszählen!"`
    }
  }

  if (q.includes("*") || q.includes("×")) {
    const match = problem.match(/(\d+)\s*[×*]\s*(\d+)/)
    if (match) {
      const [, a, b] = match
      const num1 = parseInt(a)
      const num2 = parseInt(b)
      const prod = num1 * num2

      return `📍 SCHRITT 1: Erkenne: ${num1} × ${num2} = "${num1} wird ${num2}× addiert"

📍 SCHRITT 2: Wiederholte Addition:
  ${Array(Math.min(num2, 5))
    .fill(num1)
    .join(" + ")}${num2 > 5 ? ` + ...` : ""}

✅ LÖSUNG: ${prod}

💡 MERKSATZ: "Multiplikation = Zahl wird mehrfach addiert!"`
    }
  }

  if (q.includes("/") || q.includes("÷")) {
    const match = problem.match(/(\d+)\s*[/÷]\s*(\d+)/)
    if (match) {
      const [, a, b] = match
      const num1 = parseInt(a)
      const num2 = parseInt(b)
      const quot = Math.floor(num1 / num2)

      return `📍 SCHRITT 1: Erkenne: ${num1} ÷ ${num2} = "teile ${num1} in ${num2} Teile"

📍 SCHRITT 2: Verteile fair:
  Jeder Teil bekommt: ${quot}

📍 SCHRITT 3: Kontrolle: ${num2} × ${quot} = ${num2 * quot} ✓

✅ LÖSUNG: ${quot}

💡 MERKSATZ: "Division = fair verteilen in gleiche Teile!"`
    }
  }

  // Generischer Fallback
  return `📍 SCHRITT 1: Lies die Aufgabe genau
  Aufgabe: "${problem}"

📍 SCHRITT 2: Erkenne die Rechenart
  + = Addition (zusammenzählen)
  - = Subtraktion (abziehen)
  × = Multiplikation (wiederholte Addition)
  ÷ = Division (verteilen)

📍 SCHRITT 3: Rechne Schritt für Schritt
  Schreib jeden Schritt auf

✅ LÖSUNG: ${expectedAnswer || "?"}

💡 MERKSATZ: "Langsam, Schritt für Schritt, dann schaffst du es!"`
}
