/**
 * Dashboard Analytics System
 * Student progress visualization + Parent insights
 * - Mastery by skill heatmap
 * - Learning velocity tracking
 * - Weekly/monthly reports
 * - Parent-friendly insights
 */

import { SkillMastery } from "./mastery-engine"
import { XPSystem } from "./mission-system"

export interface StudentDashboard {
  student_name: string
  current_level: number
  current_xp: number
  total_xp: number
  mastery_overview: MasteryOverview
  learning_velocity: LearningVelocity
  streak_info: StreakInfo
  this_week: WeeklyStats
  this_month: MonthlyStats
  recent_achievements: Achievement[]
  focus_areas: FocusArea[]
}

export interface MasteryOverview {
  skills_mastered_5: number // Level 5
  skills_expert_4: number // Level 4+
  skills_fluent_3: number // Level 3+
  skills_learning: number // Level 1-2
  skills_not_started: number // Level 0
  average_mastery: number // 0-5
  mastery_by_category: Record<string, number> // Category → avg level
}

export interface LearningVelocity {
  level_ups_this_week: number
  mastery_improvements_this_week: number
  new_skills_started: number
  skills_completed_this_week: number
  avg_time_per_skill_hours: number
  estimated_weeks_to_level_up: number
}

export interface StreakInfo {
  current_days: number
  longest_days: number
  missions_this_week: number
  perfect_missions_this_week: number
}

export interface WeeklyStats {
  date_range: string // "Sep 16-23"
  missions_completed: number
  xp_earned: number
  new_skills: string[]
  most_practiced_skill: string
  time_spent_hours: number
}

export interface MonthlyStats {
  date_range: string // "September"
  missions_completed: number
  xp_earned: number
  skills_mastered: string[]
  learning_hours: number
  consistency_percentage: number // % of days with practice
}

export interface Achievement {
  name: string
  description: string
  icon: string
  earned_at: Date
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface FocusArea {
  skill_name: string
  current_level: number
  next_review: Date
  recommended_action: string
  difficulty: number
}

export interface ParentReport {
  student_name: string
  report_date: Date
  period: "weekly" | "monthly"
  summary: string
  key_metrics: {
    total_xp: number
    level: number
    mastery_score: number // 0-100%
    consistency_score: number // 0-100%
  }
  highlights: string[]
  areas_for_support: string[]
  recommendations: string[]
  skill_breakdown: SkillBreakdown[]
}

export interface SkillBreakdown {
  skill_name: string
  mastery_level: number
  progress_this_period: number
  status: "mastered" | "fluent" | "learning" | "struggling"
  recommendation: string
}

/**
 * Generate Student Dashboard
 */
export function generateStudentDashboard(
  studentName: string,
  skills: SkillMastery[],
  xpSystem: XPSystem,
  achievements: Achievement[],
  periodData: {
    this_week_missions: number
    this_week_xp: number
    this_month_missions: number
    this_month_xp: number
    this_month_hours: number
  }
): StudentDashboard {
  const masteryOverview = calculateMasteryOverview(skills)
  const velocity = calculateLearningVelocity(skills, periodData, xpSystem)
  const thisWeek = calculateWeeklyStats(skills, periodData)
  const thisMonth = calculateMonthlyStats(skills, periodData)
  const focusAreas = identifyFocusAreas(skills)

  return {
    student_name: studentName,
    current_level: xpSystem.current_level,
    current_xp: xpSystem.total_xp % 500, // XP in current level
    total_xp: xpSystem.total_xp,
    mastery_overview: masteryOverview,
    learning_velocity: velocity,
    streak_info: {
      current_days: xpSystem.current_streak_missions,
      longest_days: xpSystem.best_streak_missions,
      missions_this_week: periodData.this_week_missions,
      perfect_missions_this_week: Math.floor(periodData.this_week_missions * 0.3),
    },
    this_week: thisWeek,
    this_month: thisMonth,
    recent_achievements: achievements.slice(0, 5),
    focus_areas: focusAreas,
  }
}

function calculateMasteryOverview(skills: SkillMastery[]): MasteryOverview {
  const categories: Record<string, number[]> = {}

  skills.forEach((skill) => {
    const category = skill.skill_name.split("_")[0] || "other"
    if (!categories[category]) categories[category] = []
    categories[category].push(skill.current_level)
  })

  const categoryAvgs: Record<string, number> = {}
  Object.keys(categories).forEach((cat) => {
    categoryAvgs[cat] = categories[cat].reduce((a, b) => a + b, 0) / categories[cat].length
  })

  return {
    skills_mastered_5: skills.filter((s) => s.current_level === 5).length,
    skills_expert_4: skills.filter((s) => s.current_level >= 4).length,
    skills_fluent_3: skills.filter((s) => s.current_level >= 3).length,
    skills_learning: skills.filter((s) => s.current_level >= 1 && s.current_level < 3).length,
    skills_not_started: skills.filter((s) => s.current_level === 0).length,
    average_mastery: skills.reduce((sum, s) => sum + s.current_level, 0) / skills.length,
    mastery_by_category: categoryAvgs,
  }
}

function calculateLearningVelocity(
  skills: SkillMastery[],
  periodData: any,
  xpSystem: XPSystem
): LearningVelocity {
  const avgTime = skills.reduce((sum, s) => sum + s.time_spent_minutes, 0) / skills.length / 60

  return {
    level_ups_this_week: Math.floor(periodData.this_week_xp / 500),
    mastery_improvements_this_week: skills.filter((s) => {
      const lastPracticed = new Date(s.last_practiced)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return lastPracticed > weekAgo
    }).length,
    new_skills_started: skills.filter((s) => s.current_level > 0 && s.attempts < 3).length,
    skills_completed_this_week: Math.max(0, Math.floor(periodData.this_week_missions * 0.5)),
    avg_time_per_skill_hours: avgTime,
    estimated_weeks_to_level_up: Math.max(1, Math.ceil(500 / (periodData.this_week_xp || 50))),
  }
}

function calculateWeeklyStats(skills: SkillMastery[], periodData: any): WeeklyStats {
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const newSkills = skills
    .filter((s) => {
      const practiced = new Date(s.last_practiced)
      return practiced > weekAgo && s.attempts < 3
    })
    .map((s) => s.skill_name)

  const mostPracticed = skills
    .filter((s) => {
      const practiced = new Date(s.last_practiced)
      return practiced > weekAgo
    })
    .sort((a, b) => b.attempts - a.attempts)[0]

  return {
    date_range: `Sep ${weekAgo.getDate()}-${today.getDate()}`,
    missions_completed: periodData.this_week_missions,
    xp_earned: periodData.this_week_xp,
    new_skills: newSkills,
    most_practiced_skill: mostPracticed?.skill_name || "Keine",
    time_spent_hours: periodData.this_week_missions * 0.33,
  }
}

function calculateMonthlyStats(skills: SkillMastery[], periodData: any): MonthlyStats {
  const mastered = skills.filter((s) => s.current_level === 5).map((s) => s.skill_name)

  return {
    date_range: "September 2026",
    missions_completed: periodData.this_month_missions,
    xp_earned: periodData.this_month_xp,
    skills_mastered: mastered,
    learning_hours: periodData.this_month_hours,
    consistency_percentage: Math.min(100, (periodData.this_month_missions / 30) * 100),
  }
}

function identifyFocusAreas(skills: SkillMastery[]): FocusArea[] {
  return skills
    .filter((s) => s.current_level < 3) // Not yet fluent
    .sort((a, b) => new Date(a.next_review).getTime() - new Date(b.next_review).getTime())
    .slice(0, 3)
    .map((s) => ({
      skill_name: s.skill_name,
      current_level: s.current_level,
      next_review: new Date(s.next_review),
      recommended_action:
        s.current_level === 0
          ? "🆕 Start learning this skill"
          : s.current_level === 1
            ? "📚 Keep practicing to build fluency"
            : "💪 Almost there! One more push to fluency",
      difficulty: s.current_level + 1,
    }))
}

/**
 * Generate Parent Report
 */
export function generateParentReport(
  studentName: string,
  dashboard: StudentDashboard,
  period: "weekly" | "monthly"
): ParentReport {
  const masteryPercent = (dashboard.mastery_overview.average_mastery / 5) * 100
  const consistency =
    period === "weekly"
      ? (dashboard.streak_info.missions_this_week / 5) * 100
      : dashboard.this_month.consistency_percentage

  const skillBreakdown = Object.entries(dashboard.mastery_overview.mastery_by_category).map(
    ([skill, level]) => ({
      skill_name: skill.charAt(0).toUpperCase() + skill.slice(1),
      mastery_level: level,
      progress_this_period: level > 0 ? 1 : 0,
      status: (
        level === 5
          ? "mastered"
          : level >= 3
            ? "fluent"
            : level > 0
              ? "learning"
              : "struggling"
      ) as "mastered" | "fluent" | "learning" | "struggling",
      recommendation:
        level >= 4
          ? `Great progress in this area! Consider trying challenge missions.`
          : level >= 2
            ? `Getting fluent. Regular practice will help reach mastery.`
            : `New skill. Keep practicing and don't hesitate to ask for help.`,
    })
  )

  return {
    student_name: studentName,
    report_date: new Date(),
    period,
    summary: generateParentSummary(dashboard, period),
    key_metrics: {
      total_xp: dashboard.total_xp,
      level: dashboard.current_level,
      mastery_score: Math.round(masteryPercent),
      consistency_score: Math.round(consistency),
    },
    highlights: generateHighlights(dashboard, period),
    areas_for_support: generateAreasForSupport(dashboard),
    recommendations: generateRecommendations(dashboard, period),
    skill_breakdown: skillBreakdown,
  }
}

function generateParentSummary(dashboard: StudentDashboard, period: string): string {
  const stats = period === "weekly" ? dashboard.this_week : dashboard.this_month
  return `${dashboard.student_name} completed ${stats.missions_completed} learning missions this ${period}, earning ${stats.xp_earned} XP and reaching Level ${dashboard.current_level}. Overall mastery average: ${Math.round((dashboard.mastery_overview.average_mastery / 5) * 100)}%.`
}

function generateHighlights(dashboard: StudentDashboard, period: string): string[] {
  const highlights: string[] = []

  if (dashboard.current_level > 0) {
    highlights.push(`🎉 Reached Level ${dashboard.current_level}`)
  }

  if (dashboard.mastery_overview.skills_mastered_5 > 0) {
    highlights.push(
      `🏆 ${dashboard.mastery_overview.skills_mastered_5} skill${dashboard.mastery_overview.skills_mastered_5 > 1 ? "s" : ""} at mastery level`
    )
  }

  if (dashboard.streak_info.current_days >= 7) {
    highlights.push(`🔥 ${dashboard.streak_info.current_days}-day learning streak!`)
  }

  if (dashboard.recent_achievements.length > 0) {
    highlights.push(`⭐ Earned ${dashboard.recent_achievements.length} new badges`)
  }

  return highlights
}

function generateAreasForSupport(dashboard: StudentDashboard): string[] {
  const areas: string[] = []

  if (dashboard.mastery_overview.skills_not_started > 3) {
    areas.push(`Many skills not yet attempted (${dashboard.mastery_overview.skills_not_started})`)
  }

  if (dashboard.focus_areas.length > 0 && dashboard.focus_areas[0].current_level === 0) {
    areas.push(`Getting started with: ${dashboard.focus_areas[0].skill_name}`)
  }

  if (dashboard.streak_info.current_days < 3) {
    areas.push("Consistency: Try to build a streak with daily practice")
  }

  return areas
}

function generateRecommendations(dashboard: StudentDashboard, period: string): string[] {
  const recs: string[] = []

  if (dashboard.streak_info.current_days === 0) {
    recs.push("🎯 Start a new streak! Even 10 minutes of daily practice builds momentum.")
  }

  if (dashboard.mastery_overview.skills_fluent_3 === 0) {
    recs.push(
      "📈 Focus on reaching Fluency (Level 3) in at least one skill to build confidence."
    )
  }

  if (dashboard.learning_velocity.estimated_weeks_to_level_up > 4) {
    recs.push(
      "⏱️ Try adding one more mission per week to level up faster—spaced repetition matters!"
    )
  }

  recs.push("💪 Celebrate progress! Each skill mastered is a real achievement.")

  return recs
}
