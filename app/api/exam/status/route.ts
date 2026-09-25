import { NextRequest, NextResponse } from "next/server"
import type { ExamStatus } from "@/lib/db/exam-schema"

interface UpdateStatusRequest {
  examId: string
  newStatus: ExamStatus
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateStatusRequest = await request.json()
    const { examId, newStatus } = body

    if (!examId || !newStatus) {
      return NextResponse.json(
        { error: "Missing examId or newStatus" },
        { status: 400 }
      )
    }

    const validStatuses = [
      "PLANNING",
      "PREPARING",
      "READY_FOR_SIMULATION",
      "SIMULATION_COMPLETED",
      "EXAM_TAKEN",
      "RESULT_ANALYZED",
      "COMPLETED",
    ]

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status: ${newStatus}` },
        { status: 400 }
      )
    }

    // TODO: Replace with real database call
    // For now: simulate successful status update
    const updatedExam = {
      examId,
      previousStatus: "PLANNING",
      newStatus,
      updatedAt: new Date().toISOString(),
    }

    console.log(
      `[Exam Status] Updated exam ${examId} from PLANNING to ${newStatus}`
    )

    return NextResponse.json({
      success: true,
      exam: updatedExam,
      message: `Status erfolgreich aktualisiert zu: ${newStatus}`,
    })
  } catch (error) {
    console.error("[Exam Status Error]", error)
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    )
  }
}
