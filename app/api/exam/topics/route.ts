import { NextRequest, NextResponse } from "next/server"
import { generateId } from "@/lib/utils/id-generator"

interface TopicPayload {
  topicId: string
  subtopicId?: string
  sourceType: "CONFIRMED" | "LIKELY" | "FOUNDATION" | "USER_CONFIRMED"
  confidence: number
  priority: number
}

interface SaveTopicsRequest {
  examId: string
  topics: TopicPayload[]
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveTopicsRequest = await request.json()
    const { examId, topics } = body

    if (!examId || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: "Missing examId or topics" },
        { status: 400 }
      )
    }

    // TODO: Replace with real database call once DB integration is set up
    // For now: simulate successful save and return mock response
    const savedTopics = topics.map((topic) => ({
      id: generateId("extp"),
      examId,
      topicId: topic.topicId,
      subtopicId: topic.subtopicId,
      sourceType: topic.sourceType,
      confidence: Math.min(1, Math.max(0, topic.confidence)),
      confirmed: true,
      priority: Math.min(10, Math.max(1, topic.priority)),
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    }))

    console.log(`[Exam Topics] Saved ${savedTopics.length} topics for exam ${examId}`)

    return NextResponse.json({
      success: true,
      savedTopicsCount: savedTopics.length,
      topics: savedTopics,
      nextAction: "update-status",
      message: `${savedTopics.length} Topics erfolgreich gespeichert!`,
    })
  } catch (error) {
    console.error("[Exam Topics Error]", error)
    return NextResponse.json(
      { error: "Failed to save topics" },
      { status: 500 }
    )
  }
}
