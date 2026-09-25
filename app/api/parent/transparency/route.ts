import { NextRequest, NextResponse } from "next/server"
import {
  explainDecision,
  getRecentDecisionsWithExplanations,
} from "@/lib/parent/decision-transparency"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"
    const decisionId = request.nextUrl.searchParams.get("decisionId")

    if (decisionId) {
      const explanation = await explainDecision(userId, decisionId)
      return NextResponse.json({
        success: true,
        explanation,
      })
    }

    const explanations = await getRecentDecisionsWithExplanations(userId)
    return NextResponse.json({
      success: true,
      explanations,
      message: "Recent decisions with explanations",
    })
  } catch (error) {
    console.error("[Transparency Error]", error)
    return NextResponse.json(
      { error: "Failed to get explanation", success: false },
      { status: 500 }
    )
  }
}
