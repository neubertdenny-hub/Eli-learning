import { NextRequest, NextResponse } from "next/server"
import {
  analyzeTopicReadiness,
  generateReadinessReport,
  calculateLearningPriority,
  type TopicReadinessReport,
  type ReadinessAnalysis,
  type LearningPriority,
} from "@/lib/exam/readiness-engine"
import { getDaysUntilExam } from "@/lib/exam/exam-manager"

interface ReadinessRequest {
  examId: string
  examDate: string // ISO 8601
  topics: Array<{ topicId: string; topicName: string }>
  userId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ReadinessRequest = await request.json()
    const { examId, examDate, topics, userId } = body

    if (!examId || !examDate || !topics || topics.length === 0) {
      return NextResponse.json(
        { error: "Missing examId, examDate, or topics" },
        { status: 400 }
      )
    }

    // Calculate days until exam
    const daysUntilExam = getDaysUntilExam(examDate)
    if (daysUntilExam < 0) {
      return NextResponse.json(
        { error: "Exam date is in the past" },
        { status: 400 }
      )
    }

    // Generate readiness report
    const readinessReport = generateReadinessReport(topics, userId)

    // Calculate learning priorities
    const priorities: LearningPriority[] = readinessReport.criticalTopics
      .concat(readinessReport.strongTopics)
      .map((topicReport) =>
        calculateLearningPriority(topicReport, daysUntilExam)
      )
      .sort((a, b) => {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        )
      })

    console.log(
      `[Readiness Analysis] Exam ${examId}: ${readinessReport.totalTopics} topics, ${daysUntilExam} days, ${readinessReport.overallReadiness}% overall`
    )

    return NextResponse.json({
      success: true,
      examId,
      daysUntilExam,
      readinessReport,
      prioritizedTopics: priorities,
      summary: {
        ready: readinessReport.readyTopics,
        working: readinessReport.workingTopics,
        foundation: readinessReport.foundationTopics,
        overall: readinessReport.overallReadiness,
        recommendedDailyMinutes: readinessReport.recommendedDailyMinutes,
        estimatedCompletionDate: readinessReport.estimatedCompletionDate,
      },
    })
  } catch (error) {
    console.error("[Readiness Error]", error)
    return NextResponse.json(
      { error: "Failed to analyze readiness" },
      { status: 500 }
    )
  }
}
