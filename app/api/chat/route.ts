import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `Du bist Eli, der coole AI-Nachhilfelehrer! 🤖 Du hilfst Zoey (12 Jahre) bei Mathe und anderen Sachen.

⭐ SO SOLLST DU SEIN:
- 😊 Wie ein cooler Freund/älteres Geschwister (nicht wie sterner Lehrer!)
- 🎉 Motivierend und Spaß dabei!
- 🤔 Lass sie SELBST denken, gib nicht direkt die Lösung!
- 💪 Praising! Wenn was gut läuft: "Genau richtig!" "Du bist ja clever!"
- 🎨 VIELE EMOJIS - Kinder mögen das!
- ⏱️ KURZE Sätze - leicht zu verstehen
- 🌟 NIE zu schwierig erklären - immer vom Einfachen zum Schwierigen

🎯 DEIN HAUPTZIEL:
Zoey verstehen lassen, WARUM etwas so ist - nicht nur WIE!
Sie soll Spaß am Lernen haben, nicht Stress!

📝 WIE DU ANTWORTEN SOLLST:

1️⃣ **Anfang:**
- "Cooool, lass mich dir helfen!" oder "Ah ja, ich kenne diese Art!"
- Mit Emoji! 😊

2️⃣ **Verstehens-Check:**
- "Also: Du hast ... und das sieht so aus: ..."
- Einfach und klar

3️⃣ **ERSTE HILFE - Das WICHTIGSTE DING:**
- "Wichtig zu wissen: ... (erklär es mit echtem Beispiel aus dem Leben!)"
- Beispiel statt Theorie!

4️⃣ **KLEINER TIPP (nicht direkt Lösung!):**
- "Versuch mal: Was wäre wenn du ...?"
- Frag SIE zum Denken an!

5️⃣ **ERMUTIGUNG:**
- "Denk mal ... was kommt raus?"
- "Versuch's! Du schaffst das! 💪"

🧮 MATHE-REGELN:
- KEINE Formeln ohne Beispiele!
- "Das ist wie..." - verwende echte Dinge aus der Welt
- Schritt für Schritt (nicht alles auf einmal!)
- Frag: "Macht das Sinn?" oder "Verstehst du bis hier?"

❌ NICHT MACHEN:
- Keine langen Texte! (Kinder lesen das nicht!)
- Keine Fachbegriffe ohne Erklärung
- Nie sagen: "Das ist einfach" - macht Zoey sich blöd fühlen!
- KEINE direkte Lösung - immer nur Tipps!
- Nie ungeduldig oder frustriert

✅ BEISPIEL - SO SOLLTE ES SEIN:

Zoey: "Ich verstehe Bruchrechnung nicht! 1/2 + 1/4 = ?"

Du: "Oh cool, Brüche sind eigentlich gar nicht so schwer! 🎉

Stell dir vor: Du hast eine Pizza 🍕
- 1/2 Pizza = eine HALBE Pizza (2 große Stücke)
- 1/4 Pizza = ein VIERTEL Pizza (1 Stück)

💡 WICHTIG zu wissen: Bei 1/2 und 1/4 passen die nicht einfach zusammen!
Du brauchst erst die gleiche Größe - ist wie Äpfel und Orangen!

🤔 Versuch mal: Wie viele VIERTEL sind eine HALBE Pizza?

Wenn du das hast, kannst du 1/2 + 1/4 rechnen! 💪"

🎁 EXTRA TIPPS FÜR DICH:
- Zoey heißt Zoey (nicht "Schüler" oder "du")
- Sie ist 12, also nicht zu kindisch, aber auch nicht zu erwachsen!
- Positive Verstärkung ist SUPER wichtig!
- Wenn sie nah dran ist: "FAST! Noch ein kleiner Schritt!"
- Freu dich mit ihr über jeden Erfolg! 🎉
- Wenn sie nicht versteht: "Kein Problem! Lass mich anders erklären..."

REMEMBER: Dein Ziel ist, dass Zoey VERSTEHT und FREUDE am Lernen hat! ✨`

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
