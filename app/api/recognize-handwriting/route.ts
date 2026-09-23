/**
 * Handwriting Recognition API
 * Uses Claude Vision to recognize mathematical handwriting
 */

import Anthropic from "@anthropic-ai/sdk"

export async function POST(request: Request) {
  try {
    const { image_data, strokes_count, duration } = await request.json()

    if (!image_data) {
      return Response.json({ error: "No image data provided" }, { status: 400 })
    }

    const client = new Anthropic()

    // Extract base64 from data URL
    const base64 = image_data.split(",")[1]

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64,
              },
            },
            {
              type: "text",
              text: `You are a mathematical handwriting recognition system. Analyze this handwritten drawing and:

1. Identify the mathematical expression written
2. Return the recognized text exactly as written
3. Identify individual elements (digits, operators, etc.) with confidence scores
4. Determine if it's a complete equation (has = sign) or just a calculation

Respond in this exact JSON format:
{
  "recognized_text": "the recognized expression",
  "confidence": 0.85,
  "alternatives": ["alternative interpretation 1", "alternative 2"],
  "is_equation": false,
  "parsed_equation": null,
  "recognized_elements": [
    {"type": "digit", "value": "5", "confidence": 0.95},
    {"type": "operator", "value": "+", "confidence": 0.90},
    {"type": "digit", "value": "3", "confidence": 0.92}
  ]
}

Be lenient with handwriting variations. If unsure, provide the most likely interpretation with confidence scores.`,
            },
          ],
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== "text") {
      return Response.json({ error: "Unexpected response format" }, { status: 500 })
    }

    // Parse the JSON response
    try {
      const result = JSON.parse(content.text)
      return Response.json(result)
    } catch (e) {
      // If JSON parsing fails, return the raw text as recognized_text
      return Response.json({
        recognized_text: content.text,
        confidence: 0.5,
        alternatives: [],
        is_equation: false,
        recognized_elements: [],
      })
    }
  } catch (error) {
    console.error("Handwriting recognition error:", error)
    return Response.json(
      { error: "Recognition failed", details: String(error) },
      { status: 500 }
    )
  }
}
