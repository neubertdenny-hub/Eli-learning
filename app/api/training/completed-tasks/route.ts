import { NextRequest, NextResponse } from "next/server"

interface CompletedTask {
  userId: string
  topic: string
  taskId: string
  taskQuestion: string
  completedAt: string
}

const completedTasks: CompletedTask[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, topic, taskId, taskQuestion } = body

    if (!userId || !topic || !taskId || !taskQuestion) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const task: CompletedTask = {
      userId,
      topic,
      taskId,
      taskQuestion,
      completedAt: new Date().toISOString(),
    }

    completedTasks.push(task)

    return NextResponse.json({
      success: true,
      message: "Task marked as completed",
      task,
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

    const userCompletedTasks = completedTasks.filter(
      (t) => t.userId === userId && t.topic === topic
    )

    return NextResponse.json({
      success: true,
      completedTaskIds: userCompletedTasks.map((t) => t.taskId),
      completedTasks: userCompletedTasks,
    })
  } catch (error) {
    console.error("[Get Completed Tasks Error]", error)
    return NextResponse.json(
      { error: "Failed to fetch completed tasks" },
      { status: 500 }
    )
  }
}
