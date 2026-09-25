import { NextRequest, NextResponse } from "next/server"
import {
  analyzeExamDocument,
  generatePhase8Feedback,
} from "@/lib/parent/exam-analyzer"
import { saveAssessmentAnalysis } from "@/lib/parent/school-assessment-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, userId, documentUrl } = body

    if (!assessmentId || !userId || !documentUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log(`[Exam Analysis] Analyzing ${assessmentId}`)

    // 1. Analyze exam with AI
    const analysis = await analyzeExamDocument(assessmentId, documentUrl)

    // 2. Save analysis to DB
    await saveAssessmentAnalysis(assessmentId, userId, {
      topics: analysis.recognizedTopics,
      errors: analysis.observedErrors.map((e) => `${e.topic}: ${e.errorType}`),
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      confidence: analysis.aiConfidence,
    })

    // 3. Generate Phase 8 feedback (for closed loop)
    const phase8Feedback = generatePhase8Feedback(analysis)

    // 4. Return for parent confirmation
    return NextResponse.json({
      success: true,
      analysis: {
        topics: analysis.recognizedTopics,
        errors: analysis.observedErrors,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        transferFailures: analysis.transferFailures,
        recommendations: analysis.recommendations,
        confidence: analysis.aiConfidence,
        requiresConfirmation: analysis.requiresHumanReview,
      },
      phase8Feedback,
      message:
        "Exam analyzed. Please review findings. Confirm to send feedback to ELI's learning system.",
    })
  } catch (error) {
    console.error("[Exam Analysis Error]", error)
    return NextResponse.json(
      { error: "Failed to analyze exam", success: false },
      { status: 500 }
    )
  }
}
