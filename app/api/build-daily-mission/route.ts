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

// Mock Daten - später aus DB
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
  {
    topicId: "negative_numbers",
    topicName: "Negative Zahlen",
    firstSeenAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    lastSeenAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    uploadFrequency: 1,
    recentTaskCount: 2,
    relevanceScore: 35,
    sources: ["practice"],
    masteryLevel: 3,
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId erforderlich" }, { status: 400 })
    }

    // 1. Erkenne aktuelle Schulthemen
    const currentSchoolTopics = SchoolTopicDetector.detectCurrentTopics(mockSchoolTopics)

    // 2. Erkennung von Foundation Gaps (vereinfacht)
    const detectedGaps: string[] = []
    const masteryDataWithIssues = mockMasteryData.filter((m) => m.current_level < 2)
    if (masteryDataWithIssues.length > 0) {
      detectedGaps.push(masteryDataWithIssues[0].skill_name)
    }

    // 3. Fällige Reviews
    const reviewDueSkills = mockMasteryData
      .filter((m) => {
        const daysSince = (new Date().getTime() - new Date(m.last_practiced).getTime()) / (1000 * 60 * 60 * 24)
        return daysSince > 7
      })
      .map((m) => m.skill_name)

    // 4. Baue Mission
    const mission = MissionPlanner.buildDailyMission(
      userId,
      currentSchoolTopics,
      mockMasteryData as any,
      detectedGaps,
      reviewDueSkills,
      new Map(),
      {} // Eli Memory
    )

    // 5. Berechne Review Prioritäten
    const reviewPriorities = MissionPlanner.calculateReviewPriorities(mockMasteryData as any)

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
