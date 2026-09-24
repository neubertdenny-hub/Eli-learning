import { NextRequest, NextResponse } from "next/server"
import { createExam } from "@/lib/exam/exam-manager"

/**
 * POST /api/exam/create
 * Erstelle neue Klassenarbeit
 *
 * Body:
 * {
 *   title: string,          // z.B. "Mathe Klassenarbeit"
 *   examDate: string,       // ISO 8601: "2026-10-15"
 *   description?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, examDate, description } = body

    if (!title || !examDate) {
      return NextResponse.json(
        { error: "Missing title or examDate" },
        { status: 400 }
      )
    }

    // Parse examDate
    const examDateObj = new Date(examDate)
    if (isNaN(examDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid examDate format" },
        { status: 400 }
      )
    }

    // TODO: Get userId from auth session
    const userId = "test-user"

    const exam = await createExam(userId, {
      title,
      examDate: examDateObj,
      description,
    })

    return NextResponse.json({
      success: true,
      exam,
    })
  } catch (error) {
    console.error("Error creating exam:", error)
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    )
  }
}
