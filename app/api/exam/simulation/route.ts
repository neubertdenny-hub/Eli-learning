import { NextRequest, NextResponse } from "next/server"
import {
  generatePracticeExam,
  initializePracticeExamResult,
  recordTaskAnswer,
  analyzePracticeExamResult,
  type PracticeExam,
  type PracticeExamResult,
} from "@/lib/exam/practice-exam-generator"
import type { TopicReadinessReport } from "@/lib/exam/readiness-engine"

interface GeneratePracticeExamRequest {
  examId: string
  confirmedTopicIds: string[]
  readinessReports: TopicReadinessReport[]
  optionalParams?: {
    totalMinutes?: number
    pointsPerTask?: number
  }
}

interface SubmitPracticeExamRequest {
  examId: string
  practiceExamId: string
  resultId: string
  taskAnswers: Array<{
    taskId: string
    topicId: string
    userAnswer: string
    isCorrect: boolean
    pointsEarned: number
    pointsPossible: number
  }>
}

/**
 * Generate practice exam for all confirmed topics
 */
export async function POST(request: NextRequest) {
  try {
    const body: GeneratePracticeExamRequest = await request.json()
    const { examId, confirmedTopicIds, readinessReports, optionalParams } = body

    if (!examId || !confirmedTopicIds || !readinessReports) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate exam
    const practiceExam = generatePracticeExam(
      examId,
      confirmedTopicIds,
      readinessReports,
      optionalParams
    )

    // Initialize result tracking
    const result = initializePracticeExamResult(examId, practiceExam.id)

    console.log(
      `[Practice Exam] Generated: ${practiceExam.tasks.length} tasks, ${practiceExam.estimatedTotalMinutes} min, covering ${Object.keys(practiceExam.topicCoverage).length} topics`
    )

    return NextResponse.json({
      success: true,
      exam: practiceExam,
      result,
      summary: {
        taskCount: practiceExam.tasks.length,
        estimatedMinutes: practiceExam.estimatedTotalMinutes,
        totalPoints: practiceExam.totalPointsPossible,
        topicsCovered: Object.keys(practiceExam.topicCoverage).length,
        topicBreakdown: practiceExam.topicCoverage,
      },
    })
  } catch (error) {
    console.error("[Practice Exam Generation Error]", error)
    return NextResponse.json(
      { error: "Failed to generate practice exam" },
      { status: 500 }
    )
  }
}

/**
 * Submit practice exam and get analysis
 */
export async function PUT(request: NextRequest) {
  try {
    const body: SubmitPracticeExamRequest = await request.json()
    const { examId, practiceExamId, resultId, taskAnswers } = body

    if (!examId || !practiceExamId || !resultId || !taskAnswers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Initialize result
    let result: PracticeExamResult = {
      id: resultId,
      examId,
      practiceExamId,
      startedAt: new Date().toISOString(),
      status: "SUBMITTED",
      taskResults: taskAnswers,
    }

    // For full analysis, we'd need the exam object
    // For now: basic scoring
    const totalPointsEarned = taskAnswers.reduce(
      (sum, a) => sum + a.pointsEarned,
      0
    )
    const totalPointsPossible = taskAnswers.reduce(
      (sum, a) => sum + a.pointsPossible,
      0
    )
    const percentageScore = Math.round(
      (totalPointsEarned / totalPointsPossible) * 100
    )

    console.log(
      `[Practice Exam] Submitted ${practiceExamId}: ${percentageScore}% (${totalPointsEarned}/${totalPointsPossible} pts)`
    )

    return NextResponse.json({
      success: true,
      resultId,
      score: percentageScore,
      points: {
        earned: totalPointsEarned,
        total: totalPointsPossible,
      },
      feedback: generateQuickFeedback(percentageScore),
      message: "Detaillierte Analyse in Kürze...",
    })
  } catch (error) {
    console.error("[Practice Exam Submit Error]", error)
    return NextResponse.json(
      { error: "Failed to submit practice exam" },
      { status: 500 }
    )
  }
}

/**
 * Quick feedback based on score
 */
function generateQuickFeedback(score: number): string {
  if (score >= 85) return "✅ Ausgezeichnet! Du bist exam-ready!"
  if (score >= 70) return "🟡 Gute Vorbereitung! Noch etwas Fokus auf Schwachstellen."
  return "⚠️ Mehr Übung nötig. Konzentriere dich auf schwache Topics."
}
