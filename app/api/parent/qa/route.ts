import { NextRequest, NextResponse } from "next/server"
import { answerParentQuestion } from "@/lib/parent/parent-qa-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, question } = body

    if (!userId || !question) {
      return NextResponse.json(
        { error: "Missing userId or question" },
        { status: 400 }
      )
    }

    console.log(`[Parent QA] Question from ${userId}: ${question}`)

    // Get answer from Phase 8 data
    const response = await answerParentQuestion({
      userId,
      question,
    })

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error) {
    console.error("[Parent QA Error]", error)
    return NextResponse.json(
      { error: "Failed to answer question", success: false },
      { status: 500 }
    )
  }
}
