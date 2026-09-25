import { NextRequest, NextResponse } from "next/server"
import {
  registerSchoolMaterial,
  getCurrentSchoolTopics,
  getSchoolTrainingAlignment,
} from "@/lib/parent/school-material-hub"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, fileName, documentType, extractedTopics } = body

    if (!userId || !fileName || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const material = await registerSchoolMaterial(
      userId,
      fileName,
      documentType,
      extractedTopics || []
    )

    return NextResponse.json({
      success: true,
      material,
      message: "School material registered",
    })
  } catch (error) {
    console.error("[School Materials Error]", error)
    return NextResponse.json(
      { error: "Failed to register material", success: false },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "test-user"
    const view = request.nextUrl.searchParams.get("view") || "topics"

    if (view === "topics") {
      const topics = await getCurrentSchoolTopics(userId)
      return NextResponse.json({
        success: true,
        topics,
        message: "Current school topics",
      })
    }

    if (view === "alignment") {
      const alignment = await getSchoolTrainingAlignment(userId)
      return NextResponse.json({
        success: true,
        alignment,
        message: "School-training alignment",
      })
    }

    return NextResponse.json(
      { error: "Unknown view", success: false },
      { status: 400 }
    )
  } catch (error) {
    console.error("[School Materials GET Error]", error)
    return NextResponse.json(
      { error: "Failed to get materials", success: false },
      { status: 500 }
    )
  }
}
