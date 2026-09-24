/**
 * OpenAI Vision Client
 * Für Dokumentenanalyse (Arbeitsblätter, Stoffzettel, etc.)
 */

interface VisionAnalysisRequest {
  imageUrl: string
  prompt: string
  model?: string
}

/**
 * Analysiere Bild/Dokument mit OpenAI Vision
 */
export async function getVisionAnalysis(
  request: VisionAnalysisRequest
): Promise<string | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set")
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model || "gpt-4o",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: request.imageUrl,
                },
              },
              {
                type: "text",
                text: request.prompt,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch (error) {
    console.error("Vision analysis error:", error)
    throw error
  }
}

/**
 * Analysiere PDF-Seite (Fallback: versuche als Bild)
 */
export async function analyzeDocumentPage(
  documentUrl: string,
  pageNumber?: number
): Promise<string | null> {
  const prompt = `Analysiere diese Seite eines Schulgerätes und extrahiere:
1. Hauptthemen (Mathematik-Konzepte)
2. Aufgabentypen
3. Schwierigkeitsstufe
4. Besonderheiten

Antworte strukturiert.`

  return getVisionAnalysis({
    imageUrl: documentUrl,
    prompt,
  })
}
