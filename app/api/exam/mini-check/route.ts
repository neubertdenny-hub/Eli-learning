import { NextRequest, NextResponse } from "next/server"
import {
  generateMiniCheck,
  scoreMiniCheck,
  isMiniCheckPassed,
  generateMiniCheckFeedback,
  type MiniCheckSession,
} from "@/lib/exam/mini-checks"

interface StartMiniCheckRequest {
  topicId: string
  topicName: string
  masteryScore: number
  daysUntilExam: number
}

interface SubmitMiniCheckRequest {
  sessionId: string
  session: MiniCheckSession
}

interface MiniCheckFeedbackEvent {
  topicId: string
  score: number
  passed: boolean
  previousScore?: number
}

/**
 * Start a new mini-check session
 */
export async function POST(request: NextRequest) {
  try {
    const body: StartMiniCheckRequest = await request.json()
    const { topicId, topicName, masteryScore, daysUntilExam } = body

    if (!topicId || !topicName || masteryScore === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Determine difficulty based on readiness + time pressure
    let difficulty: "easy" | "medium" | "hard" = "medium"
    if (masteryScore < 50) {
      difficulty = "easy" // Start easy if foundation weak
    } else if (masteryScore > 80 && daysUntilExam > 7) {
      difficulty = "hard" // Challenge if ready + time
    }

    const session = generateMiniCheck(topicId, topicName, masteryScore, difficulty)

    console.log(
      `[Mini-Check] Started for ${topicId} (difficulty: ${difficulty}, ${session.questions.length} questions)`
    )

    return NextResponse.json({
      success: true,
      session,
      estimatedMinutes: Math.ceil(
        session.questions.reduce((sum, q) => sum + q.estimatedSeconds, 0) / 60
      ),
    })
  } catch (error) {
    console.error("[Mini-Check Start Error]", error)
    return NextResponse.json(
      { error: "Failed to start mini-check" },
      { status: 500 }
    )
  }
}

/**
 * Submit mini-check answers and get score
 */
export async function PUT(request: NextRequest) {
  try {
    const body: SubmitMiniCheckRequest = await request.json()
    const { sessionId, session } = body

    if (!session || !session.questions) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 400 }
      )
    }

    // Score the session
    const scoredSession = scoreMiniCheck(session)
    const passed = isMiniCheckPassed(scoredSession)
    const feedback = generateMiniCheckFeedback(scoredSession)

    console.log(
      `[Mini-Check] Completed ${sessionId}: score=${scoredSession.score}%, passed=${passed}`
    )

    // Prepare feedback event for readiness update
    const feedbackEvent: MiniCheckFeedbackEvent = {
      topicId: scoredSession.topicId,
      score: scoredSession.score || 0,
      passed,
    }

    return NextResponse.json({
      success: true,
      session: scoredSession,
      score: scoredSession.score,
      passed,
      feedback,
      nextAction: scoredSession.nextAction,
      feedbackEvent,
    })
  } catch (error) {
    console.error("[Mini-Check Submit Error]", error)
    return NextResponse.json(
      { error: "Failed to score mini-check" },
      { status: 500 }
    )
  }
}
