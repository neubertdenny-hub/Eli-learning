import { NextRequest, NextResponse } from "next/server"

// Fallback in-memory for local testing only
const completedTasksMemory: Map<string, Set<string>> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, topic, taskId, taskQuestion } = body

    if (!userId || !topic || !taskId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Store in memory (fallback - ideally would use DB)
    const key = `${userId}:${topic}`
    if (!completedTasksMemory.has(key)) {
      completedTasksMemory.set(key, new Set())
    }
    completedTasksMemory.get(key)!.add(taskId)

    console.log(`[Completed Task] ${userId}/${topic}/${taskId}`)

    return NextResponse.json({
      success: true,
      message: "Task marked as completed",
      taskId,
    })
  } catch (error) {
    console.error("[Completed Tasks Error]", error)
    return NextResponse.json(
      { error: "Failed to save completed task" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const topic = searchParams.get("topic")

    if (!userId || !topic) {
      return NextResponse.json(
        { error: "userId and topic required" },
        { status: 400 }
      )
    }

    const key = `${userId}:${topic}`
    const completedIds = Array.from(completedTasksMemory.get(key) || new Set())

    console.log(`[Get Completed Tasks] ${userId}/${topic}: ${completedIds.length} tasks`)

    return NextResponse.json({
      success: true,
      completedTaskIds: completedIds,
      completedTasks: completedIds.map(id => ({ taskId: id })),
    })
  } catch (error) {
    console.error("[Get Completed Tasks Error]", error)
    return NextResponse.json(
      { error: "Failed to fetch completed tasks" },
      { status: 500 }
    )
  }
}
