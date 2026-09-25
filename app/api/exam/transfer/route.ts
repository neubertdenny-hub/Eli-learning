import { NextRequest, NextResponse } from "next/server"
import { generateTransferTask, type TransferTask } from "@/lib/exam/mini-checks"

interface StartTransferRequest {
  topicIds: string[]
  topicNames: string[]
  masteryScores: Record<string, number>
  difficulty?: "medium" | "hard"
}

interface SubmitTransferRequest {
  taskId: string
  topicIds: string[]
  userAnswer: string
  isCorrect: boolean
}

/**
 * Generate a transfer task combining multiple topics
 */
export async function POST(request: NextRequest) {
  try {
    const body: StartTransferRequest = await request.json()
    const { topicIds, topicNames, masteryScores, difficulty = "medium" } = body

    if (!topicIds || topicIds.length < 2 || !topicNames) {
      return NextResponse.json(
        { error: "Need at least 2 topics for transfer task" },
        { status: 400 }
      )
    }

    // Only generate transfer if both topics have some readiness
    const avgMastery = topicIds.reduce((sum, id) => sum + (masteryScores[id] || 0), 0) / topicIds.length
    if (avgMastery < 40) {
      return NextResponse.json(
        { error: "Topics not ready for transfer yet" },
        { status: 400 }
      )
    }

    const task = generateTransferTask(topicIds, topicNames, masteryScores, difficulty)

    console.log(
      `[Transfer Task] Generated combining ${topicNames.join(" + ")}`
    )

    return NextResponse.json({
      success: true,
      task,
      estimatedMinutes: task.estimatedMinutes,
      difficulty: task.difficulty,
    })
  } catch (error) {
    console.error("[Transfer Task Error]", error)
    return NextResponse.json(
      { error: "Failed to generate transfer task" },
      { status: 500 }
    )
  }
}

/**
 * Submit transfer task solution
 */
export async function PUT(request: NextRequest) {
  try {
    const body: SubmitTransferRequest = await request.json()
    const { taskId, topicIds, userAnswer, isCorrect } = body

    if (!taskId || !topicIds || isCorrect === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log(
      `[Transfer Task] Submitted ${taskId}: correct=${isCorrect}`
    )

    // Prepare feedback for readiness update
    const feedbackEvent = {
      type: "TRANSFER_RESULT" as const,
      topicIds,
      success: isCorrect,
      timeSpent: 0, // Would be tracked on client
    }

    return NextResponse.json({
      success: true,
      taskId,
      isCorrect,
      feedback: isCorrect
        ? `✅ Sehr gut! Du hast die Konzepte richtig kombiniert.`
        : `❌ Versuche es nochmal. Denk an die Schritte aus beiden Topics.`,
      feedbackEvent,
    })
  } catch (error) {
    console.error("[Transfer Submit Error]", error)
    return NextResponse.json(
      { error: "Failed to submit transfer task" },
      { status: 500 }
    )
  }
}
