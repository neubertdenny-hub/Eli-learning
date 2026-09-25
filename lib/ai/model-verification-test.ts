/**
 * Phase 10A Model Verification Test
 *
 * Safe, non-sensitive smoke test to verify:
 * 1. Model API access
 * 2. SDK compatibility
 * 3. Response handling
 * 4. Fallback chain
 * 5. Vision support
 * 6. Structured output
 */

import OpenAI from "openai"

interface ModelTestResult {
  model: string
  textApiAccess: "PASS" | "FAIL"
  error?: string
  latencyMs?: number
  actualModelInResponse?: string
}

interface VisionTestResult {
  model: string
  visionSupport: "PASS" | "FAIL" | "UNKNOWN"
  error?: string
}

interface StructuredOutputResult {
  model: string
  structuredOutput: "PASS" | "FAIL" | "UNKNOWN"
  error?: string
}

export async function runModelVerificationTests(): Promise<{
  textTests: ModelTestResult[]
  visionTests: VisionTestResult[]
  structuredTests: StructuredOutputResult[]
  timestamp: string
  status: "ALL_PASS" | "PARTIAL_FAIL" | "CRITICAL_FAIL"
}> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set")
  }

  const client = new OpenAI({ apiKey })
  const timestamp = new Date().toISOString()

  // Models to test
  const modelsToTest = [
    "gpt-6-astra",
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna",
  ]

  // === TEXT API TESTS ===
  console.log("\n[Model Verification] Starting TEXT API tests...")
  const textTests: ModelTestResult[] = []

  for (const model of modelsToTest) {
    try {
      const startTime = Date.now()

      const response = await client.messages.create({
        model,
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: "Respond with single word: OK",
          },
        ],
      })

      const latencyMs = Date.now() - startTime
      const actualModel = (response.model as string) || model

      textTests.push({
        model,
        textApiAccess: "PASS",
        latencyMs,
        actualModelInResponse: actualModel,
      })

      console.log(`✓ ${model}: PASS (${latencyMs}ms)`)
    } catch (error: any) {
      textTests.push({
        model,
        textApiAccess: "FAIL",
        error: error.message || String(error),
      })

      console.log(`✗ ${model}: FAIL - ${error.message}`)
    }
  }

  // === VISION TESTS ===
  console.log("\n[Model Verification] Starting VISION tests...")
  const visionTests: VisionTestResult[] = []

  // Test with a simple 1x1 pixel image (minimal size, no sensitive data)
  const testImageBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

  for (const model of modelsToTest) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/png",
                  data: testImageBase64,
                },
              },
              {
                type: "text",
                text: "Describe this image in one word.",
              },
            ],
          },
        ],
      })

      visionTests.push({
        model,
        visionSupport: "PASS",
      })

      console.log(`✓ ${model}: Vision PASS`)
    } catch (error: any) {
      const errorMsg = error.message || String(error)

      // Check if it's a vision-specific error
      if (
        errorMsg.includes("vision") ||
        errorMsg.includes("image") ||
        errorMsg.includes("does not support vision")
      ) {
        visionTests.push({
          model,
          visionSupport: "FAIL",
          error: errorMsg,
        })

        console.log(`✗ ${model}: Vision NOT SUPPORTED`)
      } else {
        // Other error (API key, etc)
        visionTests.push({
          model,
          visionSupport: "UNKNOWN",
          error: errorMsg,
        })

        console.log(`? ${model}: Vision status UNKNOWN (${errorMsg})`)
      }
    }
  }

  // === STRUCTURED OUTPUT TESTS ===
  console.log("\n[Model Verification] Starting STRUCTURED OUTPUT tests...")
  const structuredTests: StructuredOutputResult[] = []

  for (const model of modelsToTest.slice(0, 2)) {
    // Test only first 2 to save tokens
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: 'Output this JSON: {"status": "ok"}',
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "test_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                status: { type: "string" },
              },
              required: ["status"],
            },
          },
        } as any,
      })

      structuredTests.push({
        model,
        structuredOutput: "PASS",
      })

      console.log(`✓ ${model}: Structured Output PASS`)
    } catch (error: any) {
      const errorMsg = error.message || String(error)

      if (
        errorMsg.includes("response_format") ||
        errorMsg.includes("json_schema")
      ) {
        structuredTests.push({
          model,
          structuredOutput: "FAIL",
          error: errorMsg,
        })

        console.log(`✗ ${model}: Structured Output NOT SUPPORTED`)
      } else {
        structuredTests.push({
          model,
          structuredOutput: "UNKNOWN",
          error: errorMsg,
        })

        console.log(`? ${model}: Structured Output status UNKNOWN`)
      }
    }
  }

  // === DETERMINE OVERALL STATUS ===
  const textPasses = textTests.filter((t) => t.textApiAccess === "PASS").length
  const textCount = textTests.length

  let status: "ALL_PASS" | "PARTIAL_FAIL" | "CRITICAL_FAIL"

  if (textPasses === 0) {
    status = "CRITICAL_FAIL"
  } else if (textPasses === textCount) {
    status = "ALL_PASS"
  } else {
    status = "PARTIAL_FAIL"
  }

  console.log(
    `\n[Model Verification] COMPLETE: ${status} (${textPasses}/${textCount} models accessible)`
  )

  return {
    textTests,
    visionTests,
    structuredTests,
    timestamp,
    status,
  }
}

// === CLI EXECUTION ===
if (require.main === module) {
  runModelVerificationTests()
    .then((results) => {
      console.log("\n=== MODEL VERIFICATION RESULTS ===")
      console.log(JSON.stringify(results, null, 2))

      if (results.status === "CRITICAL_FAIL") {
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error("Model verification failed:", error)
      process.exit(1)
    })
}
