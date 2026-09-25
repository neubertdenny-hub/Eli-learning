/**
 * Phase 9J: Goals & Notifications
 * Weekly goals + alerts for parents
 */

import { getDatabase } from "@/lib/db/connection"
import { schoolTopicSignals } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface WeeklyGoal {
  id: string
  userId: string
  week: string
  goalType: "foundation" | "transfer" | "mastery" | "catch_up"
  topics: string[]
  targetSessions: number
  targetMinutes: number
  priority: "high" | "medium" | "low"
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type:
    | "exam_prep_needed"
    | "foundation_gap"
    | "streak_milestone"
    | "topic_mastered"
    | "exam_feedback"
    | "goal_reached"
  title: string
  message: string
  actionUrl?: string
  read: boolean
  createdAt: string
}

/**
 * Generate weekly goals from school topics
 */
export async function generateWeeklyGoals(
  userId: string,
  weekStart: Date = new Date()
): Promise<WeeklyGoal[]> {
  const db = getDatabase()

  const schoolTopics = await db
    .select()
    .from(schoolTopicSignals)
    .where(eq(schoolTopicSignals.userId, userId))

  const now = new Date()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const recentTopics = (schoolTopics || []).filter(
    (s) => new Date(s.lastSeenAt) > twoWeeksAgo
  )

  const goals: WeeklyGoal[] = []
  const weekStr = weekStart.toISOString().split("T")[0]

  if (recentTopics.length > 0) {
    // Priority: catch-up on topics not yet started
    const notStarted = recentTopics.filter((t) => (t.masteryLevel || 0) === 0)
    if (notStarted.length > 0) {
      goals.push({
        id: `goal-${userId}-${weekStr}-catchup`,
        userId,
        week: weekStr,
        goalType: "catch_up",
        topics: notStarted.map((t) => t.topicName),
        targetSessions: Math.min(notStarted.length * 3, 15),
        targetMinutes: Math.min(notStarted.length * 30, 120),
        priority: "high",
        createdAt: now.toISOString(),
      })
    }

    // Secondary: deepen in-progress topics
    const inProgress = recentTopics.filter(
      (t) => (t.masteryLevel || 0) > 0 && (t.masteryLevel || 0) < 4
    )
    if (inProgress.length > 0) {
      goals.push({
        id: `goal-${userId}-${weekStr}-transfer`,
        userId,
        week: weekStr,
        goalType: "transfer",
        topics: inProgress.map((t) => t.topicName),
        targetSessions: Math.min(inProgress.length * 2, 10),
        targetMinutes: Math.min(inProgress.length * 20, 90),
        priority: "medium",
        createdAt: now.toISOString(),
      })
    }
  }

  // Default: general foundation work if no school topics
  if (goals.length === 0) {
    goals.push({
      id: `goal-${userId}-${weekStr}-default`,
      userId,
      week: weekStr,
      goalType: "foundation",
      topics: ["grundrechenarten"],
      targetSessions: 10,
      targetMinutes: 90,
      priority: "medium",
      createdAt: now.toISOString(),
    })
  }

  return goals
}

/**
 * Create notification for important event
 */
export async function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  actionUrl?: string
): Promise<Notification> {
  const notification: Notification = {
    id: `notif-${userId}-${Date.now()}`,
    userId,
    type,
    title,
    message,
    actionUrl,
    read: false,
    createdAt: new Date().toISOString(),
  }

  console.log(`[Notifications] ${type} for ${userId}: ${title}`)
  return notification
}

/**
 * Generate notifications from exam feedback
 */
export function generateExamNotifications(
  userId: string,
  examTitle: string,
  transferFailures: string[],
  foundationGaps: string[]
): Notification[] {
  const notifications: Notification[] = []

  if (transferFailures.length > 0) {
    notifications.push({
      id: `notif-${userId}-transfer-${Date.now()}`,
      userId,
      type: "exam_feedback",
      title: `Übungstransfer-Lücke in ${examTitle}`,
      message: `Zoey trainierte ${transferFailures[0]}, konnte es aber nicht in der Klassenarbeit anwenden. Nächste Woche: Mehr Anwendungsaufgaben.`,
      actionUrl: `/parent/closed-loop`,
      read: false,
      createdAt: new Date().toISOString(),
    })
  }

  if (foundationGaps.length > 0) {
    notifications.push({
      id: `notif-${userId}-foundation-${Date.now()}`,
      userId,
      type: "foundation_gap",
      title: "Grundlagen-Check empfohlen",
      message: `In ${examTitle} erkannt: ${foundationGaps[0]} Grundlagen könnten unsicher sein.`,
      actionUrl: `/parent/overview`,
      read: false,
      createdAt: new Date().toISOString(),
    })
  }

  return notifications
}

/**
 * Generate notifications for milestones
 */
export function generateMilestoneNotifications(
  userId: string,
  masteredTopics: string[],
  streakDays: number
): Notification[] {
  const notifications: Notification[] = []

  if (masteredTopics.length > 0) {
    notifications.push({
      id: `notif-${userId}-mastery-${Date.now()}`,
      userId,
      type: "topic_mastered",
      title: `🎉 Beherrscht: ${masteredTopics[0]}`,
      message: `Zoey hat ${masteredTopics[0]} gemeistert! Sie kann es jetzt auch in neuen Situationen anwenden.`,
      read: false,
      createdAt: new Date().toISOString(),
    })
  }

  if (streakDays > 0 && streakDays % 7 === 0) {
    notifications.push({
      id: `notif-${userId}-streak-${Date.now()}`,
      userId,
      type: "streak_milestone",
      title: `${streakDays} Tage Trainings-Streak! 🔥`,
      message: `Beeindruckend! Zoey trainiert jetzt ${streakDays} Tage hintereinander.`,
      read: false,
      createdAt: new Date().toISOString(),
    })
  }

  return notifications
}
