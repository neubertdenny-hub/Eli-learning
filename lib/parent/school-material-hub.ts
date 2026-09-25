/**
 * Phase 9I: School Material Hub
 * Track school documents and current topics being taught
 */

import { getDatabase } from "@/lib/db/connection"
import { schoolTopicSignals } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface SchoolMaterial {
  id: string
  userId: string
  fileName: string
  uploadedAt: string
  documentType: "worksheet" | "test" | "homework" | "textbook" | "other"
  extractedTopics: string[]
  relevanceScore: number
}

export interface CurrentSchoolTopic {
  topicId: string
  topicName: string
  currentlyTeaching: boolean
  uploadFrequency: number
  lastSeenAt: string
  relatedEliTopics: string[]
  trainingStatus: "not_started" | "in_progress" | "mastered"
}

/**
 * Register uploaded school material
 */
export async function registerSchoolMaterial(
  userId: string,
  fileName: string,
  documentType: SchoolMaterial["documentType"],
  extractedTopics: string[]
): Promise<SchoolMaterial> {
  const db = getDatabase()
  const now = new Date().toISOString()

  const material: SchoolMaterial = {
    id: `material-${userId}-${Date.now()}`,
    userId,
    fileName,
    uploadedAt: now,
    documentType,
    extractedTopics,
    relevanceScore: extractedTopics.length > 0 ? 0.8 : 0.3,
  }

  // Update topic signals based on material
  for (const topic of extractedTopics) {
    const relevanceScore = documentType === "test" ? 90 : 70

    await db
      .insert(schoolTopicSignals)
      .values({
        id: `signal-${userId}-${topic}-${Date.now()}`,
        userId,
        topicId: topic.toLowerCase().replace(/\s+/g, "-"),
        topicName: topic,
        firstSeenAt: now,
        lastSeenAt: now,
        uploadFrequency: 1,
        recentTaskCount: 0,
        relevanceScore,
        sources: JSON.stringify([fileName]),
        masteryLevel: 0,
      })
      .catch(() => {
        // Topic already tracked, will be updated by school topic monitoring
      })
  }

  console.log(`[School Hub] Registered material: ${fileName}`)
  return material
}

/**
 * Get current school topics (what's being taught NOW)
 */
export async function getCurrentSchoolTopics(
  userId: string
): Promise<CurrentSchoolTopic[]> {
  const db = getDatabase()

  const signals = await db
    .select()
    .from(schoolTopicSignals)
    .where(eq(schoolTopicSignals.userId, userId))

  const now = new Date()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  return (signals || [])
    .filter((s) => new Date(s.lastSeenAt) > twoWeeksAgo)
    .map((s) => ({
      topicId: s.topicId,
      topicName: s.topicName,
      currentlyTeaching: true,
      uploadFrequency: s.uploadFrequency || 0,
      lastSeenAt: s.lastSeenAt,
      relatedEliTopics: mapSchoolTopicToEliTopics(s.topicName),
      trainingStatus: getTrainingStatus(s.masteryLevel || 0),
    }))
}

/**
 * Map school topic names to ELI training topics
 */
function mapSchoolTopicToEliTopics(schoolTopic: string): string[] {
  const mapping: Record<string, string[]> = {
    bruch: ["bruchrechnung", "dezimalzahlen"],
    brüche: ["bruchrechnung", "dezimalzahlen"],
    dezimal: ["dezimalzahlen", "bruchrechnung"],
    multiplikation: ["multiplikation", "schriftliche-multiplikation"],
    division: ["division", "schriftliche-division"],
    geometrie: ["geometrie", "fläche", "umfang"],
    prozent: ["prozentrechnung", "bruchrechnung"],
    gleichung: ["gleichungen", "algebra"],
  }

  for (const [keyword, topics] of Object.entries(mapping)) {
    if (schoolTopic.toLowerCase().includes(keyword)) {
      return topics
    }
  }

  return [schoolTopic.toLowerCase().replace(/\s+/g, "-")]
}

/**
 * Get training status for a school topic
 */
function getTrainingStatus(
  masteryLevel: number
): "not_started" | "in_progress" | "mastered" {
  if (masteryLevel === 0) return "not_started"
  if (masteryLevel >= 4) return "mastered"
  return "in_progress"
}

/**
 * Get alignment between school curriculum and training progress
 */
export async function getSchoolTrainingAlignment(
  userId: string
): Promise<{
  alignedTopics: string[]
  aheadTopics: string[]
  behindTopics: string[]
  alignmentScore: number
}> {
  const schoolTopics = await getCurrentSchoolTopics(userId)

  const alignedTopics: string[] = []
  const behindTopics: string[] = []

  for (const topic of schoolTopics) {
    if (topic.trainingStatus === "in_progress") {
      alignedTopics.push(topic.topicName)
    } else if (topic.trainingStatus === "not_started") {
      behindTopics.push(topic.topicName)
    }
  }

  const alignmentScore = alignedTopics.length / (schoolTopics.length || 1)

  return {
    alignedTopics,
    aheadTopics: [],
    behindTopics,
    alignmentScore: Math.min(1, alignmentScore),
  }
}
