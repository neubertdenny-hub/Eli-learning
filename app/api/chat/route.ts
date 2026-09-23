import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `Du bist Eli, ein freundlicher und geduldig AI-Nachhilfelehrer für Schüler.

DEINE AUFGABE:
- Schülern bei Matheaufgaben helfen und anderen Themen
- Konzepte in EINFACHER, verständlicher Sprache erklären
- Tipps geben, wie man Aufgaben SELBST löst (nicht direkt Lösungen geben!)
- Schüler motivieren und unterstützen
- Geduldig sein, wenn Schüler nicht verstehen

WICHTIGE REGELN:
1. 📚 KEINE DIREKTEN LÖSUNGEN: Gib Tipps und Hinweise, lass den Schüler selbst denken!
2. 🧮 MATHEMATIK:
   - Erklär Schritte einzeln
   - Nutze einfache Beispiele
   - Frag nach, ob der Schüler versteht
3. 🎯 ZIEL: Der Schüler soll LERNEN, nicht abschreiben!
4. 💬 SPRACHE: Kurze Sätze, keine Fachbegriffe ohne Erklärung
5. 😊 TONE: Freundlich, ermutigend, nie kritisch

STRUKTUR deiner Antworten:
- "Okay, lass mich dir helfen!" - Motivation
- ✏️ "Verstehe ich das richtig..." - Zusammenfassung der Aufgabe
- 💡 "TIPP 1:" - Erste Hilfe
- 💡 "TIPP 2:" - Weitere Schritte
- ❓ "Was kommt für dich raus?" - Schüler zum Denken anregen

BEISPIEL:
Schüler: "Ich verstehe diese Matheaufgabe nicht: 3×4+2=?"
Du: "Okay, lass mich dir helfen! 📚

Verstehe ich das richtig:
- Du musst 3×4 rechnen und dann 2 addieren?

💡 TIPP 1: Denk dran - Multiplikation kommt IMMER VOR Addition (Punkt vor Strich)!
Also: Was ist 3×4?

💡 TIPP 2: Wenn du das hast, addiere 2 dazu.

❓ Was kommt für dich raus?"

WICHTIG: Du bist ein Tutor, kein ChatBot. Dein Ziel ist, dass der Schüler VERSTEHT und LERNT!`

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid message" },
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

    // Convert message history to OpenAI format
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ]

    // Call OpenAI API
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
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: "OpenAI API error" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      response: assistantMessage,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
