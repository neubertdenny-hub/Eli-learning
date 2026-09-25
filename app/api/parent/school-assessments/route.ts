import { NextRequest, NextResponse } from "next/server"
import {
  saveSchoolAssessment,
  getSchoolAssessments,
  confirmAssessment,
} from "@/lib/parent/school-assessment-service"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"
    const assessments = await getSchoolAssessments(userId)

    return NextResponse.json({
      success: true,
      assessments,
    })
  } catch (error) {
    console.error("[Get Assessments Error]", error)
    return NextResponse.json({ error: "Failed to fetch assessments", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const assessment = await saveSchoolAssessment(body)

    return NextResponse.json({
      success: true,
      assessment,
      message: "Assessment saved. Please confirm details before we analyze.",
    })
  } catch (error) {
    console.error("[Save Assessment Error]", error)
    return NextResponse.json({ error: "Failed to save assessment", success: false }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, action } = body

    if (action === "confirm") {
      await confirmAssessment(assessmentId)
      return NextResponse.json({ success: true, message: "Assessment confirmed" })
    }

    return NextResponse.json({ error: "Unknown action", success: false }, { status: 400 })
  } catch (error) {
    console.error("[Assessment Action Error]", error)
    return NextResponse.json({ error: "Failed to process action", success: false }, { status: 500 })
  }
}
