/**
 * Topic Card Component
 *
 * Shows a learning topic with its status (GREEN/YELLOW/RED).
 * Used in progress view and for topic selection.
 */

import React from "react"
import Link from "next/link"

type MasteryStatus = "green" | "yellow" | "red" | "new"

interface TopicCardProps {
  title: string
  emoji?: string
  status?: MasteryStatus
  successRate?: number // 0-100
  lastPracticed?: string // e.g. "Heute", "Gestern", "Vor 3 Tagen"
  onClick?: () => void
  href?: string
}

const STATUS_INFO: Record<MasteryStatus, { gradient: string; label: string; icon: string; badgeColor: string }> = {
  green: {
    gradient: "from-emerald-500/10 to-teal-500/10",
    label: "Sicher beherrscht!",
    icon: "✅",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  yellow: {
    gradient: "from-amber-500/10 to-orange-500/10",
    label: "Noch üben",
    icon: "⚡",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  red: {
    gradient: "from-rose-500/10 to-red-500/10",
    label: "Schwierig",
    icon: "🆘",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  new: {
    gradient: "from-indigo-500/10 to-purple-500/10",
    label: "Neu",
    icon: "✨",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },
}

export function TopicCard({
  title,
  emoji = "📚",
  status = "new",
  successRate = 0,
  lastPracticed,
  onClick,
  href,
}: TopicCardProps) {
  const info = STATUS_INFO[status]

  const content = (
    <div
      className={`relative p-6 rounded-xl bg-gradient-to-br ${info.gradient} border border-white/30 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-white/50 hover:scale-105 group`}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content - relative z-10 */}
      <div className="relative z-10 space-y-4">
        {/* Top Row: Emoji + Title */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-5xl">{emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${info.badgeColor}`}>
          <span>{info.icon}</span>
          <span>{info.label}</span>
        </div>

        {/* Success Rate (if applicable) */}
        {status !== "new" && successRate > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-600 font-medium">Erfolgsquote</span>
              <span className="font-bold text-indigo-600">{successRate}%</span>
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Last Practiced */}
        {lastPracticed && (
          <div className="text-xs text-gray-600">📅 Zuletzt: {lastPracticed}</div>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left"
    >
      {content}
    </button>
  )
}

/**
 * Topic Grid – displays multiple topics
 */

interface TopicGridProps {
  topics: Array<React.ComponentProps<typeof TopicCard>>
}

export function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic, idx) => (
        <TopicCard key={idx} {...topic} />
      ))}
    </div>
  )
}
