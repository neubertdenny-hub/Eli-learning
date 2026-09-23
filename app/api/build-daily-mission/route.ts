/**
 * POST /api/build-daily-mission
 *
 * Erstellt automatisch die persönliche Tagesmission für einen Schüler
 *
 * Liest:
 * - Current school topics
 * - Mastery data
 * - Foundation gaps
 * - Review schedule
 * - Recent errors
 * - Eli Memory
 *
 * Gibt zurück:
 * - Geplante Mission mit Blöcken
 * - Erklärungstexte
 * - Selection Reasons
 */

import { NextRequest, NextResponse } from "next/server"
import { MissionPlanner, DailyMission } from "@/lib/learning/mission-planner"
import { SchoolTopicDetector } from "@/lib/learning/school-topic-detector"
import { skillMasteryRepository, schoolTopicRepository } from "@/lib/db/repositories"

// Daten aus Database
async function getMasteryData(userId: string) {
  try {
    return await skillMasteryRepository.getByUser(userId)
  } catch (error) {
    console.error("Failed to fetch mastery data:", error)
    // Fallback zu Mock wenn DB fehlt
    return mockMasteryData
  }
}

async function getSchoolTopics(userId: string) {
  try {
    return await schoolTopicRepository.getByUser(userId)
  } catch (error) {
    console.error("Failed to fetch school topics:", error)
    // Fallback zu Mock
    return mockSchoolTopics
  }
}

// Mock Daten - Fallback wenn DB nicht funktioniert
const mockMasteryData = [
  {
    skill_name: "Addieren mit negativen Zahlen",
    current_level: 3,
    attempts: 8,
    correct_attempts: 6,
    time_spent_minutes: 45,
    last_practiced: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    next_review: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    skill_name: "Bruchrechnung",
    current_level: 2,
    attempts: 12,
    correct_attempts: 7,
    time_spent_minutes: 120,
    last_practiced: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    next_review: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    skill_name: "Einmaleins",
    current_level: 4,
    attempts: 30,
    correct_attempts: 28,
    time_spent_minutes: 90,
    last_practiced: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    next_review: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const mockSchoolTopics = [
  {
    topicId: "bruchrechnung",
    topicName: "Bruchrechnung",
    firstSeenAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastSeenAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    uploadFrequency: 3,
    recentTaskCount: 5,
    relevanceScore: 75,
    sources: ["upload", "practice"],
    masteryLevel: 2,
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId erforderlich" }, { status: 400 })
    }

    // 1. Hole echte Daten aus Database
    const [masteryData, schoolTopicsData] = await Promise.all([
      getMasteryData(userId),
      getSchoolTopics(userId),
    ])

    // 2. Erkenne aktuelle Schulthemen - konvertiere DB-Daten zu Interface
    const schoolTopicsForDetector = schoolTopicsData.length > 0
      ? schoolTopicsData.map((t: any) => ({
          topicId: t.topicId,
          topicName: t.topicName,
          firstSeenAt: new Date(t.firstSeenAt),
          lastSeenAt: new Date(t.lastSeenAt),
          uploadFrequency: t.uploadFrequency || 0,
          recentTaskCount: t.recentTaskCount || 0,
          relevanceScore: t.relevanceScore || 0,
          sources: t.sources ? JSON.parse(t.sources) : [],
          masteryLevel: t.masteryLevel || 0,
        }))
      : mockSchoolTopics

    const currentSchoolTopics = SchoolTopicDetector.detectCurrentTopics(schoolTopicsForDetector)

    // 3. Erkennung von Foundation Gaps
    const detectedGaps: string[] = []
    const masteryDataWithIssues = (masteryData as any[]).filter((m) => {
      const level = m.currentLevel !== undefined ? m.currentLevel : (m.current_level || 0)
      return level < 2
    })
    if (masteryDataWithIssues.length > 0) {
      const skill = masteryDataWithIssues[0]
      const skillName = skill.skillName !== undefined ? skill.skillName : skill.skill_name
      detectedGaps.push(skillName)
    }

    // 4. Fällige Reviews
    const reviewDueSkills = masteryData
      .filter((m: any) => {
        const daysSince =
          (new Date().getTime() - new Date(m.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
        return daysSince > 7
      })
      .map((m: any) => m.skillName)

    // 5. Konvertiere Mastery Daten zu erwartetem Format
    const masteryDataForPlanner = masteryData.map((m: any) => ({
      skill_name: m.skillName || m.skill_name,
      current_level: m.currentLevel || m.current_level,
      attempts: m.attempts || 0,
      correct_attempts: m.correctAttempts || m.correct_attempts || 0,
      time_spent_minutes: m.timeSpentMinutes || m.time_spent_minutes || 0,
      last_practiced: m.lastPracticed || m.last_practiced,
      next_review: m.nextReview || m.next_review,
    }))

    // 6. Baue Mission
    const mission = MissionPlanner.buildDailyMission(
      userId,
      currentSchoolTopics,
      masteryDataForPlanner as any,
      detectedGaps,
      reviewDueSkills,
      new Map(),
      {} // Eli Memory
    )

    // 7. Berechne Review Prioritäten
    const reviewPriorities = MissionPlanner.calculateReviewPriorities(masteryDataForPlanner as any)

    return NextResponse.json(
      {
        success: true,
        mission,
        currentSchoolTopics,
        reviewPriorities,
        reasoning: {
          primaryTopic: currentSchoolTopics.primary?.topicName || "Keine aktuelle Aufgabe",
          foundationGaps: detectedGaps.length > 0 ? detectedGaps : ["Keine Lücken erkannt"],
          reviewDueCount: reviewDueSkills.length,
          confidence: currentSchoolTopics.confidence,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Mission build error:", error)
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Mission" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/build-daily-mission?userId=xxx
 *
 * Holt die aktuelle Mission des Tages
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId erforderlich" }, { status: 400 })
    }

    // Später: Aus DB laden
    // Jetzt: Neu erstellen
    return POST(request)
  } catch (error) {
    console.error("Mission fetch error:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Mission" },
      { status: 500 }
    )
  }
}
