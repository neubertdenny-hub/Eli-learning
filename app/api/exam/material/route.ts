import { NextRequest, NextResponse } from "next/server"
import { analyzeExamMaterial, inferMaterialType, getLowConfidenceTopics } from "@/lib/exam/material-analyzer"
import type { AnalysisResult } from "@/lib/exam/material-analyzer"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { examId, materials } = body

    if (!examId || !materials || !Array.isArray(materials)) {
      return NextResponse.json(
        { error: "examId and materials array required" },
        { status: 400 }
      )
    }

    // Analyze each material
    const results: AnalysisResult[] = []
    for (const material of materials) {
      const { documentUrl, fileName } = material

      if (!documentUrl || !fileName) {
        console.error("Missing documentUrl or fileName:", material)
        continue
      }

      const materialType = inferMaterialType(fileName)

      try {
        const analysis = await analyzeExamMaterial(documentUrl, materialType)
        results.push(analysis)
      } catch (err) {
        console.error(`Failed to analyze ${fileName}:`, err)
        // Continue with other materials even if one fails
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No materials could be analyzed" },
        { status: 400 }
      )
    }

    // Merge topics from all materials
    const allTopics = results.flatMap(r => r.topics)

    // Group by topic name (deduplicate)
    const topicMap = new Map()
    for (const topic of allTopics) {
      const key = topic.topicName.toLowerCase()
      if (!topicMap.has(key)) {
        topicMap.set(key, topic)
      } else {
        // Keep higher confidence version
        const existing = topicMap.get(key)
        if (topic.confidence > existing.confidence) {
          topicMap.set(key, topic)
        }
      }
    }

    const uniqueTopics = Array.from(topicMap.values())

    // Get low confidence topics that need user confirmation
    const lowConfidenceTopics = getLowConfidenceTopics(uniqueTopics, 0.7)

    return NextResponse.json({
      success: true,
      topics: uniqueTopics,
      lowConfidenceTopics,
      materialCount: results.length,
      overallConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
    })
  } catch (error) {
    console.error("[Material Upload Error]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    )
  }
}
