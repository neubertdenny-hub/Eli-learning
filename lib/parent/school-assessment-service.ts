/**
 * Phase 9D: School Assessment Service
 * Tracks real school assessments (tests, exams, grades)
 */

import { getDatabase } from "@/lib/db/connection"
import { schoolAssessments, schoolAssessmentAnalysis } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export type AssessmentType = "CLASS_TEST" | "EXAM" | "QUIZ" | "HOMEWORK" | "OTHER"

export interface SchoolAssessmentInput {
  userId: string
  title: string
  assessmentType: AssessmentType
  date: string // YYYY-MM-DD
  subject?: string
  topics?: string[]
  pointsEarned?: number
  pointsPossible?: number
  grade?: string
  gradeScale?: string // "15-point", "6-point"
  teacherFeedback?: string
}

export interface SchoolAssessmentRecord extends SchoolAssessmentInput {
  id: string
  confirmed: boolean
  createdAt: Date
}

/**
 * Create or update school assessment
 */
export async function saveSchoolAssessment(
  assessment: SchoolAssessmentInput
): Promise<SchoolAssessmentRecord> {
  const db = getDatabase()

  const id = `assess-${assessment.userId}-${Date.now()}`
  const now = new Date().toISOString()

  await db.insert(schoolAssessments).values({
    id,
    userId: assessment.userId,
    title: assessment.title,
    assessmentType: assessment.assessmentType,
    date: assessment.date,
    subject: assessment.subject,
    topics: assessment.topics ? JSON.stringify(assessment.topics) : null,
    pointsEarned: assessment.pointsEarned,
    pointsPossible: assessment.pointsPossible,
    grade: assessment.grade,
    gradeScale: assessment.gradeScale,
    teacherFeedback: assessment.teacherFeedback,
    confirmed: 0,
    createdAt: now,
    updatedAt: now,
  })

  return {
    id,
    ...assessment,
    confirmed: false,
    createdAt: new Date(now),
  }
}

/**
 * Get assessments for user
 */
export async function getSchoolAssessments(userId: string): Promise<SchoolAssessmentRecord[]> {
  const db = getDatabase()

  const records = await db
    .select()
    .from(schoolAssessments)
    .where(eq(schoolAssessments.userId, userId))

  return records.map((r) => ({
    id: r.id,
    userId: r.userId,
    title: r.title,
    assessmentType: r.assessmentType as AssessmentType,
    date: r.date,
    subject: r.subject || undefined,
    topics: r.topics ? JSON.parse(r.topics) : undefined,
    pointsEarned: r.pointsEarned || undefined,
    pointsPossible: r.pointsPossible || undefined,
    grade: r.grade || undefined,
    gradeScale: r.gradeScale || undefined,
    teacherFeedback: r.teacherFeedback || undefined,
    confirmed: r.confirmed === 1,
    createdAt: new Date(r.createdAt),
  }))
}

/**
 * Confirm assessment (parent verified data)
 */
export async function confirmAssessment(assessmentId: string): Promise<void> {
  const db = getDatabase()

  await db
    .update(schoolAssessments)
    .set({ confirmed: 1, updatedAt: new Date().toISOString() })
    .where(eq(schoolAssessments.id, assessmentId))

  console.log(`[School Assessment] Confirmed: ${assessmentId}`)
}

/**
 * Save AI analysis of assessment
 */
export async function saveAssessmentAnalysis(
  assessmentId: string,
  userId: string,
  analysis: {
    topics: string[]
    errors: string[]
    strengths: string[]
    weaknesses: string[]
    confidence: number
  }
): Promise<void> {
  const db = getDatabase()

  await db.insert(schoolAssessmentAnalysis).values({
    id: `analysis-${assessmentId}`,
    assessmentId,
    userId,
    analyzedTopics: JSON.stringify(analysis.topics),
    recognizedErrors: JSON.stringify(analysis.errors),
    strengths: JSON.stringify(analysis.strengths),
    weaknesses: JSON.stringify(analysis.weaknesses),
    aiConfidence: analysis.confidence,
    createdAt: new Date().toISOString(),
  })

  console.log(`[Assessment Analysis] Saved for ${assessmentId}`)
}
